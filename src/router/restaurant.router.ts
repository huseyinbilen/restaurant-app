import express from "express"
import * as restaurantController from "../controller/restaurant.controller"
import { authtenticateForRestaurant, authtenticateForUser } from "../../middleware/authentication.middleware"
const restaurantRouter = express.Router()


restaurantRouter.post("/register",restaurantController.register)
restaurantRouter.post("/login",restaurantController.login)
restaurantRouter.get("/my-account",[authtenticateForRestaurant],restaurantController.getRestaurantProfile)
restaurantRouter.post("/update",[authtenticateForRestaurant],restaurantController.updateRestaurantProfile)
restaurantRouter.post("/delete",restaurantController.deleteRestaurant)
restaurantRouter.post("/menu/add",[authtenticateForRestaurant],restaurantController.addMenu)
restaurantRouter.post("/filter/search",[authtenticateForUser],restaurantController.findRestaurantsByMenuKey)
restaurantRouter.post("/menu/add-multiple",[authtenticateForRestaurant],restaurantController.createMultipleMenuItems)
restaurantRouter.get("/filter/male-reviewers",restaurantController.getMaleReviewersByAge)
restaurantRouter.get("/filter/restaurant-by-type",restaurantController.getFilteredRestaurants)
restaurantRouter.get("/filter/most-voted-restaurants", restaurantController.getRestaurantsByAverageRating)

export default restaurantRouter;