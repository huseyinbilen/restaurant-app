import express from "express"
import * as userController from "../controller/user.controller"
import { authtenticateForUser } from "../../middleware/authentication.middleware"
const userRouter = express.Router()


userRouter.post("/register",userController.register)
userRouter.post("/login",userController.login)
userRouter.get("/my-account",[authtenticateForUser],userController.getUserProfile)
userRouter.post("/upload-photo",[authtenticateForUser],userController.updateAvatar)
userRouter.post("/update",[authtenticateForUser],userController.updateUserProfile)
userRouter.post("/delete",userController.deleteUser)
userRouter.post("/order/new",[authtenticateForUser],userController.newOrder)
userRouter.post("/order/review",[authtenticateForUser],userController.newReview)

export default userRouter;