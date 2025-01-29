import express from 'express';
import multer from 'multer';
import MyRestaurantController from '../controllers/MyRestaurantController';
import { jwtCheck, jwtParse } from '../middleware/auth';
import { validateMyRestaurantRequest } from '../middleware/validation';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // File size is limited to 5MB
  }
})

// upload.single("imageFile") will check for an input of an image file when the post request is hit
// It's important for the requests then valdidation to be first before the authentication check, then lastly is the controller (That's the proper process and practice)
router.post("/", upload.single("imageFile"), validateMyRestaurantRequest, jwtCheck, jwtParse, MyRestaurantController.createMyRestaurant)

router.put("/", upload.single("imageFile"), validateMyRestaurantRequest, jwtCheck, jwtParse, MyRestaurantController.updateMyRestaurant)

router.get("/order", jwtCheck, jwtParse, MyRestaurantController.getMyRestaurantOrders)

router.patch("/order/:orderId/status", jwtCheck, jwtParse, MyRestaurantController.updateOrderStatus)

router.get("/", jwtCheck, jwtParse, MyRestaurantController.getMyRestaurant)

export default router;