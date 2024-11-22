import { Response, Request } from 'express';
import User from '../models/user';


const getCurrentUser = async(req: Request, res: Response): Promise<any> => {
  try{
    const currentUser = await User.findOne({ _id: req.userId });

    if(!currentUser){
      return res.status(404).json({ message: "User not found"})
    }

    // When getting data in outputting it, you'll need to convert it into json as response
    res.json(currentUser);
  }
  catch(error){
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

const createCurrentUser = async(req: Request, res: Response): Promise<any> => {
  try{
    // 1.) check if user exists
    // It will be used to find existing users
    // auth0Id and email will be the only one to be 
    const { auth0Id } = req.body; // This is the only field that's needed to remember the existing user for security purposes
    const existingUser = await User.findOne({ auth0Id });

    // Doesn't do anything but send the 200 status which can be seen in the inspect
    if(existingUser){
      return res.status(200).send();
    }
    // 2.) create user if it doesn't exist
    // It will come from auth0 (frontend) to the backend database which will be stored in here
    // Creation of the data to be stored in the variable for creating new user
    const newUser = await new User(req.body);
    // Executing the creation of user
    await newUser.save()

    // 3.) Return the user object in the frontend (So it can be displayed in the user profile)
    // The newUser that was created becomes a javascript object at the same time returns it 
    res.status(201).json(newUser.toObject())
  } catch(error){
    // See error
    // The error handling is always shown in the backend for security purposes
    console.log(error);
    res.status(500).json({ message: "Error creating user"});
  }
};

const updateCurrentUser = async(req: Request, res: Response): Promise<any> =>{
  try{
    // Trying to get the data that the user inputs 
    const { name, addressLine1, country, city } = req.body;
    // Basically it just gets the main user Id of the logged in user through auth0Id through the token (authorized user)
    const user = await User.findById(req.userId);

    if(!user){
      return res.status(404).json({ message: "User not found"});
    }

    // Able to edit if it passes the auth0Id and userId match check
    user.name = name;
    user.addressLine1 = addressLine1;
    user.country = country;
    user.city = city;

    await user.save();
    
    res.send(user);
  }
  catch(error){
    console.log(error);
    res.status(500).json({ message: "Error updating user"});
  }
}

export default{
  getCurrentUser, createCurrentUser, updateCurrentUser, 
};