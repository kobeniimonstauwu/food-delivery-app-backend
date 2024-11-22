import { NextFunction, Request, Response } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import jwt from "jsonwebtoken";
import User from "../models/user";

declare global{
  namespace Express{
    interface Request{
      userId: string;
      auth0Id: string;
    }
  }
}

// This function already has built in next function, and has its own structure and error handling when it comes to authorization
export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256'
});

export const jwtParse = async(req: Request, res: Response, next: NextFunction): Promise<any> => {
  // Getting the token from the authorization in the header
  const { authorization } = req.headers;
  
  // Bearer ey23891273891278391289
  // It automatically knows the authorization to get due to the starts with bearer logic
  if(!authorization || !authorization.startsWith("Bearer ")){
    return res.sendStatus(401);
  }
  // Splits the bearer and the token itself, 0 might be bearer and the 1 might be the token itself
  const token = authorization.split(" ")[1];

  try{
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    // Decoded so we can get and access the user data 
    const auth0Id = decoded.sub;

    // Checks in the backend which user is connected by accessing that user's auth0Id
    const user = await User.findOne({ auth0Id });

    // NEEDS TO KNOW IF THE USER FROM AUTH0 EXISTS IN THE DATABASE FOR SECURITY FIRST
    if(!user){
      // Also the database does not have data for this user
      // Unauthorized. More precautionary measures against hackers or unauthorized users
      return res.sendStatus(401);
    }

    // req. is fixed through declaring the interface of the request
    // the right side is fixed by declaring it as string since the left side is expecting a string

    req.auth0Id = auth0Id as string; // auth id which comes from auth 0  which is the same one in the database (as you can see it already checks if both are matching
    // there'll only be a user if it matches the auth0id from the decoded token, for security)
    req.userId = user._id.toString(); //mongo db id
    next(); // Continues to proceed to the controller logic
    
  }
  catch(error){
    // Not much info against hackers, so don't console log it
    return res.sendStatus(401);
  }
}

// The auth function will check the authorization header with the bearer (So basically it'll just check the token)
// It will check if the token belongs to the logged in user
// Basically in the backend it will expect a token, so trying to put a post request in postman won't work if the api is already applied in the 

//jwtCheck is going to be included when adding the middleware in the routes file


// Need to install
//npm i express-oauth2-jwt -bearer


// need to install jsonwebtoken to get the token's info along with the user data for updating user profile
// npm i jsonwebtoken
// and npm i @types/jsonwebtoken --save-dev (this gives different kinds of useful functions and features for making development easier)