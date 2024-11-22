import express from "express"
import MyUserController from "../controllers/MyUserController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyUserRequest } from "../middleware/validation";

const router = express.Router();

// Executes if "/api/my/user" is a post request, it will execute the createCurrentUser function in the controller
router.get("/", jwtCheck, jwtParse, MyUserController.getCurrentUser);
router.post("/", jwtCheck, MyUserController.createCurrentUser);
router.put("/", jwtCheck, jwtParse, validateMyUserRequest, MyUserController.updateCurrentUser);

// Since router was the only thing mainly used here
export default router;