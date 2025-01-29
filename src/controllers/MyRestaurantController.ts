import { Request, Response } from 'express'
import Restaurant from '../models/restaurant'
import cloudinary from 'cloudinary'
import mongoose from 'mongoose'
import Order from '../models/order'

const getMyRestaurant = async(req: Request, res: Response): Promise<any> => {
  try{
    // it fetches the matching userId from the token
    const restaurant = await Restaurant.findOne({ user: req.userId })
    if(!restaurant){
      return res.status(404).json({ message: "restaurant not found" })
    }
    // It's not send since it's not a post or put request
    res.json(restaurant)

  }
  catch(error){
    console.log(error)
    res.status(500).json({ message: "Error fetching restaurant" })
  }
}

const createMyRestaurant = async(req: Request, res: Response): Promise<any> => {
  try{
    // 1 restaurant per account (user)

    // req: userId is from the token
    const existingRestaurant = await Restaurant.findOne({ user: req.userId })

    // We will check for existence of the current user through
    // userId from the token that matches with the Restaurant database in the "POST" from the 
    // user database which means the user already created a restaurant

    if(existingRestaurant){
      return res.status(409).json({ message: "User Restaurant already exists. Limited up to 1 only for users" })
      // It'll handle the requests directly in the backend (Postman)
    }
    
    // Look at function below for reference
    const imageUrl = await uploadImage(req.file as Express.Multer.File)
    // This is a newly created restaurant from the form
    const restaurant = new Restaurant(req.body)
    // Image url returned from cloudinary
    restaurant.imageUrl = imageUrl
    // This is the authenticated userId based on the token and putting the data here so that every user only can create 1 restaurant
    // The ObjectId is only used for different collections used in another collection
    restaurant.user = new mongoose.Types.ObjectId(req.userId)
    // Gets the current date once it's submitted
    restaurant.lastUpdated = new Date()

    await restaurant.save()
    
    // 201 is the status code for "created" 
    // send is used in scenarios where you are going to use the created data in the frontend
    res.status(201).send(restaurant)

  }
  catch(error){
    console.log(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

const updateMyRestaurant = async(req: Request, res: Response): Promise<any> =>{
  try{
    const restaurant = await Restaurant.findOne({
      user: req.userId
    })

    if(!restaurant){
      return res.status(404).json({ message: "Restaurant not found"})
    }
    //Changes the data of that single existing restaurant record directly
    restaurant.restaurantName = req.body.restaurantName
    restaurant.city = req.body.city
    restaurant.country = req.body.country
    restaurant.deliveryPrice = req.body.deliveryPrice
    restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime
    restaurant.cuisines = req.body.cuisines
    restaurant.menuItems = req.body.menuItems
    restaurant.lastUpdated = new Date()
    
    if(req.file){
      const imageUrl = await uploadImage(req.file as Express.Multer.File)
      restaurant.imageUrl = imageUrl
    }

    await restaurant.save()
    res.status(200).send(restaurant)
  }
  catch(error){
    console.log(error)
    res.status(500).json({ message: "Something went wrong"})
  }
}

const uploadImage = async(file: Express.Multer.File) =>{
  const image = file
  // Now convert the image to base string
  const base64Image = Buffer.from(image.buffer).toString("base64")
  // Then here the data consist of the image type and the encoded base64 string information/details
  const dataURI = `data:${image.mimetype};base64,${base64Image}`

  // Uploads the string data to cloudinary then returns an image URL
  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI)

  return uploadResponse.url
}

const getMyRestaurantOrders = async(req: Request, res: Response): Promise<any>=>{
  try{
    const restaurant = await Restaurant.findOne({user: req.userId})

    if(!restaurant){
      return res.status(404).json({ message: "Restaurant not found"})
    }

    const orders = await Order.find({ restaurant: restaurant._id}).populate("restaurant").populate("user")
    res.json(orders)
    
  }
  catch(error){
    console.log(error)
    res.status(500).json({ message: "Something went wrong"})
  }
}

const updateOrderStatus = async(req: Request, res: Response): Promise<any> =>{
  try{
    const { orderId } = req.params
    const { status } = req.body

    const order = await Order.findById(orderId)

    if(!order){
      return res.status(404).json({ message: "Order not found"})

    }
    // Restaurant is needed in order to verify if a restaurant is owned by the user updating it
    const restaurant = await Restaurant.findById(order.restaurant)

    if(restaurant?.user?._id.toString() !== req.userId){
      return res.status(401).send()
      // 401 kicks the unauthorized users
    }

    order.status = status

    await order.save()

    res.status(200).json(order)
  }
  catch(error){
    console.log(error)
    res.status(500).json({ message: "Unable to update order"})
  }
}

export default{
  getMyRestaurant,
  createMyRestaurant,
  updateMyRestaurant,
  getMyRestaurantOrders,
  updateOrderStatus
}

