import express from "express"
import cors from "cors"
import userRouter from "./router/user.router";
import restaurantRouter from "./router/restaurant.router";

const app = express()

// MIDDLEWARE
app.use(express.json())
app.use(cors());

// ROUTE
app.use("/user", userRouter)
app.use("/restaurant", restaurantRouter)

export default app