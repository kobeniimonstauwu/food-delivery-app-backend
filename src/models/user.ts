import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  // Contains properties and their settings
  // The id is linked to the auth0 database to our own database
  // The only required ones are the id, and email because it gets created when the user logs or registers for the first time
  // The password is not needed since auth0 is already handling it
  auth0Id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  addressLine1:{
    type: String,
  },
  city:{
    type: String,
  },
  country:{
    type: String,
  }
  // Profile picture
})

// Creation of user model
const User = mongoose.model("User", userSchema);

// Exports the User model
export default User;