import mongoose from "mongoose";

// This has its own model since it will be heavily processed, in terms of HTTP Requests such as post requests, get requests once orders are processed, 
// PUT requests when the order status is updating, etc

const orderSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant"},
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deliveryDetails:{
    email: {type: String, required: true},
    name: {type: String, required: true},
    addressLine1: {type: String, required: true},
    city: {type: String, required: true},
    country: {type: String, required: true}
  },
  cartItems:[
    {
      menuItemId: {type: String, required: true},
      quantity: {type: Number, required: true},
      name: {type: String, required: true}

    }
  ],
  totalAmount: Number,
  status:{
    type: String,
    enum: ["placed", "paid", "inProgress", "outForDelivery", "delivered"]
  },
  createdAt: {type: Date, default: Date.now}

  
})


const Order = mongoose.model("Order", orderSchema)

export default Order