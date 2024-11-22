// There is a package for validating any kind of request
// npm i express-validator
import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

const handleValidationErrors = async(req: Request, res: Response, next: NextFunction): Promise<any> =>{

  // The request is what's set in the body in the validateMyUserRequest
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array });

    // What is returned in the response here will be used for the frontend to know which inputs had validation error and show it in the frontend

  }
  next(); //This is needed to proceed to the user controller's other middleware function so it can be used
}
// inside the array are multiple pieces of middleware
export const validateMyUserRequest = [
  // Validation for non string inputs
  // checks the req.body which are the inputs for the update, and should have the same name like we did in the req.body
  // This also checks for inputs where it is only full of empty spaces
  body("name").isString().notEmpty().withMessage("Name must be a string"),
  body("addressLine1").isString().notEmpty().withMessage("Address must be a string"),
  body("city").isString().notEmpty().withMessage("City must be a string"),
  body("country").isString().notEmpty().withMessage("Country must be a string"),
  // it will read any of the requests that have the validation set, and returns an error and status if there are validation errors 
  handleValidationErrors
];