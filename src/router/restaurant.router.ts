import express from "express"
import * as restaurantController from "../controller/restaurant.controller"
import { authtenticateForRestaurant } from "../../middleware/authentication.middleware"
const restaurantRouter = express.Router()


restaurantRouter.post("/register",restaurantController.register)
restaurantRouter.post("/login",restaurantController.login)
restaurantRouter.post("/delete",restaurantController.deleteRestaurant)
restaurantRouter.post("/menu/add",[authtenticateForRestaurant], restaurantController.addMenu)
restaurantRouter.post("/menu/add",[authtenticateForRestaurant], restaurantController.createMultipleMenuItems)

export default restaurantRouter;