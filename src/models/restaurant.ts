import mongoose, { InferSchemaType } from 'mongoose'

// Ids will generate in this separate schema which can then be used for dropdowns in ordering food
const menuItemsSchema = new mongoose.Schema({
  // Although this automatically generates an objectId, we need to explicitly create it here for the type in the parameter for the stripe payment page
  // It needs to be required and generated since it'll be used for the stripe payment page and will be relying on that as a parameter (always)
  // This modified id can be used as a type for stripe payment, as well as the default allowing us to not to expect the actual id value in the controller
  _id: { type: mongoose.Schema.Types.ObjectId, required: true, default: () => new mongoose.Types.ObjectId()}, 
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  }
})

export type MenuItemType = InferSchemaType<typeof menuItemsSchema>

const restaurantSchema = new mongoose.Schema({
  // takes the _id from User database
  user: { 
    type: mongoose.Schema.Types.ObjectId, ref: "User"
  },
  // It contains the user field where it is and objectId based on the user collection/model for figuring out which user made the request
  // It may be needed in order to prepopulate the fields as well as know who the user is
  restaurantName: {
    type: String,
    required: true,
  },
  city:{
    type: String,
    required: true,
  },
  country:{
    type: String,
    required: true,
  },
  deliveryPrice:{
    type: Number,
    required: true,
  },
  estimatedDeliveryTime:{
    type: Number,
    required: true,
  },
  // Cuisines can be multiple so that's why it's stored in an array (It's used in tags - it will use checkboxes and already predefined)
  // It's predefined and will not be accessed again except for filtering and read only so that's why it doesn't need a schema
  cuisines: [{
    type: String,
    required: true,
  }],
  // Menu item is going to be put in an array, but it goes into a schema and it will be used in a dropdown and it's not predefined so it will need a schema 
  // in order for the data to be dynamic (It will be reused)
  menuItems:[
    menuItemsSchema
  ],
  // Uses a URL instead of an image itself due to storage issues, it will just store cloudinary's URL images in which these URLs can be used to access the image
  imageUrl:{
    type: String,
    required: true,
  },
  // Used for metrics, as well as filtering for newly updated restaurants
  lastUpdated:{
    type: Date,
    required: true,
  }


})

const Restaurant = mongoose.model("Restaurant", restaurantSchema)

export default Restaurant