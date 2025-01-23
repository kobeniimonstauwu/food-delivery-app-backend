import { Request, Response } from 'express'
import Stripe from "stripe"
import Restaurant, { MenuItemType } from '../models/restaurant'
import Order from '../models/order'

// STRIPE is needed to create a session
const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string)
const FRONTEND_URL = process.env.FRONTEND_URL as string
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string

// Restaurant id is passed in order to check if there is a restaurant, but mainly for getting its menu items
// cartItems to know what menuItems to actually pick
// deliveryDetails to know which user is undergoing payment

type CheckoutSessionRequest = {
  cartItems: {
    menuItemId: string
    name: string
    // To be converted later on as number
    quantity: string
    // The data for the price will be fetched from the database itself (restaurant collection for a given restaurantId)
    // It is for security purposes since people can make requests through postman through the req.body, so that they can't create their own price values since it's not expected in the req
    // .body through this type
  }[],
  deliveryDetails:{
    email: string
    name: string
    addressLine1: string
    // No country because we can get that info from stripe
    city: string
  }
  restaurantId: string
}

const getMyOrders = async(req: Request, res: Response): Promise<any> =>{
  try{
    const orders = await Order.find({ user: req.userId }).populate("restaurant").populate("user")

    res.json(orders)
  }
  catch(error){
    console.log(error)
    res.status(500).json({ message : "Something went wrong"})
  }
}

const stripeWebhookHandler = async(req: Request, res: Response): Promise<any> =>{
  let event
  // Stripe will construct an event once it knows that the request is coming from stripe through the secret
  try{
  const sig = req.headers["stripe-signature"]
  event = STRIPE.webhooks.constructEvent(req.body, sig as string, STRIPE_ENDPOINT_SECRET) 
  }
  catch(error:any){
    console.log(error)
    return res.status(400).send(`Webhook error: ${error.message}`)
  }

// the 'return' above is a good keyword since it stops at that line to avoid typescript errors or any errors for having undefined variables
 if(event.type === "checkout.session.completed"){
  // orderId is created from the session when checked out as metadata
  const order = await Order.findById(event.data.object.metadata?.orderId)

  if(!order){
    return res.status(404).json({ message: "Order not found"})
  }

  order.totalAmount = event.data.object.amount_total
  order.status = "paid"

  await order.save()

 }
 
 res.status(200).send()
 
}




const createCheckoutSession = async(req: Request, res: Response): Promise<any> => {
  try{
    // This request is linked to when the delivery details have been submitted completely
    const checkoutSessionRequest: CheckoutSessionRequest = req.body
    
    const restaurant = await Restaurant.findById(checkoutSessionRequest.restaurantId)

    if(!restaurant){
      throw new Error("Restaurant not found")
    }

    const newOrder = new Order({
      restaurant: restaurant,
      user: req.userId,
      deliveryDetails: checkoutSessionRequest.deliveryDetails,
      cartItems: checkoutSessionRequest.cartItems,
      status: "placed",
      createdAt: new Date()
    })   

    // This will include the cart items that will be included in the stripe payment page
    const lineItems = createLineItems(checkoutSessionRequest, restaurant.menuItems)

    // The orderId already exists after it's creation as an object, no need to be saved first
    const session = await createSession(lineItems, newOrder._id.toString(), restaurant.deliveryPrice, restaurant._id.toString())

    // The session is what is responsible for making the lineItems appear, and making the payment page appear
    if(!session.url){
      return res.status(500).json({message: "Error creating stripe session"})
    }

    await newOrder.save()
    
    // This response from stripe will be used in the frontend to display the payment page
    res.json({url: session.url})

    // Right after this a webhook will be used to update the details of the order
    // StripeCLI is needed for testing webhooks locally
  }
  // It is different from the usual since we want to know the error when dealing with stripe
  catch(error:any){
    console.log(error)
    res.status(500).json({ message: error.raw.message })
  }
  // As recommended by stripe
  res.status(200).send()
}



const createLineItems = (checkoutSessionRequest: CheckoutSessionRequest, menuItems: MenuItemType[]) => {
  // All will be converted to lineItems before going to stripe

  // Each cart item will have a matching menuItem object (to get the price) 
  const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
    // It finds the menu item for all cart items in order to determine which items need to have a price fetched
    
    // Each item will be processed here individually through the menu item and return each line item one by one 
    const menuItem = menuItems.find((item) => item._id.toString() === cartItem.menuItemId.toString())

    // Bugs can happen and it can handle this properly, or when the menuItem is deleted when a user is ordering at the same time
    if(!menuItem){
      throw new Error(`Menu item not found: ${cartItem.menuItemId}`)
    }

    // The visual payments that are matching the menu item prices are order summary and menuitemdetail components in the frontend
    // As for the form, it's the managerestaurant form, where you can change the value of 1 and also find a way around the integer and cents to pesos conversion
    // which should be aligned with the value of pence

    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data:{
        currency:"php",
        unit_amount: menuItem.price * 100,
        product_data:{
          name: menuItem.name
        },
      },
      quantity: parseInt(cartItem.quantity)
    }
    return line_item
  })
  // Then each cart item will be converted to a stripe lineItem Object

  // Then returns all the objects in the loop where each line_item is processed
  return lineItems
  // return a lineItem Array
}

const createSession = async(lineItems: Stripe.Checkout.SessionCreateParams.LineItem[], orderId: string, deliveryPrice: number, restaurantId: string) =>{
  const sessionData = await STRIPE.checkout.sessions.create({
    line_items: lineItems,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Delivery",
          type: "fixed_amount",
          fixed_amount: {
            amount: deliveryPrice * 100,
            currency: "php"
          }
        }
      }
    ],
    mode: "payment",
    // Restaurant id isn't required but useful for debugging, also for redirecting them back to the page if ever there's something wrong with processing the payment
    // if any errors had occured or other problems
    metadata:{
      orderId,
      restaurantId
    },
    success_url: `${FRONTEND_URL}/order-status?success=true`,
    cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancelled=true`
  })
  return sessionData
}

export default {
  createCheckoutSession,
  stripeWebhookHandler,
  getMyOrders
}
