// Initialization of express is here
// API ROUTES ARE HANDLED HERE
// ACTIONS TO STRIPE AND MONGODB

import express, {Request, Response} from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/myUserRoute"


mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("Connected to Database!"))

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

// Done endpoint

app.listen(7000, ()=>{
  // This is a function if the server starts successfully
  console.log("Server started on localhost:7000")
})