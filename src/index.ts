// Initialization of express is here
// API ROUTES ARE HANDLED HERE
// ACTIONS TO STRIPE AND MONGODB

import express, {Request, Response} from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/myUserRoute";
import myRestaurantRoute from "./routes/myRestaurantRoute";
import restaurantRoute from "./routes/RestaurantRoute";
import { v2 as cloudinary } from 'cloudinary';
// v2 is the original name since it's the second version, but cloudinary is more descriptive  

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("Connected to Database!"))

// Cloudinary is used for storing images and can be accessed through a link (It uses cloud storage so storage issues aren't going to be a problem)
// It can also be connected to the database through the url and be accessed as an image in the frontend
// It needs cloudinary, multer (for handling images easier), @types/multer (for typescript intellisense)
// This is needed to access cloudinary at the start
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const app = express();

app.use(express.json()) // Middleware (converts body of request in api to json)
app.use(cors()); //initialize cors

// Extra confirmation if the server is running 
app.get("/health", async(req: Request, res:Response) =>{
  res.json({ message: "Health Ok"});
});



//endpoint testing
// app.get("/test", async(req: Request, res: Response)=>{ 
//   res.json({message: "Hello"})
//   // When endpoint /test is requested from the backend server, it will respond with response
// })

// /my/ makes it more easier since it's a naming convention on REST API because of tokens, and other features for authentication
// Once this endpoint is executed, it will send a request to the "myUserRoute"
app.use("/api/my/user", myUserRoute)

app.use("/api/my/restaurant", myRestaurantRoute)

app.use("/api/restaurant", restaurantRoute)

// Done endpoint

app.listen(7000, ()=>{
  // This is a function if the server starts successfully
  console.log("Server started on localhost:7000")
})



// 