import { Request, Response, NextFunction } from "express"
import * as argon2 from "argon2";
import User from "../data/user/user.data"
import { generateToken } from "../utils/jwt.user.utils"
import Order from "../data/order/order.data";
import { updateRestaurantAverageRating } from "./restaurant.controller";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    // Password Encryption
    req.body.password = await argon2.hash(req.body.password);

    const { username, password, email, birthday, gender, address } = req.body;

    try {
        User.create({ username, password, email, birthday, gender, address })
            .then(result => {
                res.status(200).json({
                    status: "success",
                    msg: "User Created Successfully"
                });
            })
            .catch(exception => {
                console.error(exception);
                res.status(500).json({
                    status: "fail",
                    msg: "User Creation Failed"
                });
            });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "fail", msg: "User Creation Failed" });
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const value = await User.findOne({ username: req.body.username, isDeleted: false });

        if (value) {
            const passwordMatches = await argon2.verify(value.password, req.body.password);

            if (passwordMatches) {
                const jwtToken = await generateToken({ _id: value._id.toString(), username: value.username });
                res.json({ token: jwtToken });
            } else {
                res.status(500).json({ status: "fail", msg: "Invalid username or password" });
            }
        } else {
            res.status(401).json({ status: "fail", msg: "Invalid username or password" });
        }
    } catch (exception) {
        console.error(exception);
        res.status(500).json({ status: "fail", msg: "User Login Failed" });
    }
}

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.body.user._id;

        const user = await User.findById(userId, { password: 0 });

        if (!user) {
            res.status(404).json({ status: "fail", msg: "User not found" });
            return;
        }
        res.status(200).json({ status: "success", msg: "User profile retrieved successfully", user });
    } catch (error) {
        console.error("Error getting user profile:", error);
        res.status(500).json({ status: "fail", msg: "Error getting user profile" });
    }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.body.user._id;

        req.body.password = await argon2.hash(req.body.password);

        const { username, email, password } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username, email, password },
            { new: true }
        );

        if (!updatedUser) {
            res.status(404).json({ status: "fail", msg: "User not found" });
            return;
        }

        res.status(200).json({ status: "success", msg: "User profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ status: "fail", msg: "Error updating user profile" });
    }
};

export const deleteUser = (req: Request, res: Response, next: NextFunction) => {
    User.updateOne({ username: req.body.username }, { isDeleted: true })
        .then((result) => {
            console.log(result);

            if (result) {
                res.status(200).json({ status: "success", msg: "User Delete Successfully" });
            } else {
                res.status(500).json({ status: "success", msg: "User Delete Failed" });
            }
        })
        .catch((exception) => {
            console.error(exception);
            res.status(500).json({ status: "fail", msg: "User Delete Failed" });
        })
}

export const newOrder = async (req: Request, res: Response) => {
    try {
        const { items, address, restaurantId } = req.body;
        const userId = req.body.user._id;

        const totalPrice = items.reduce((totalPrice: any, items: { price: any; }) => totalPrice + items.price, 0);

        const order = await Order.create({ items, totalPrice, address, restaurantId, userId});

        res.status(200).json({ status: "success", msg: "Order Created Successfully", order });
    } catch (error) {
        console.error("Order creation failed:", error);
        res.status(500).json({ status: "fail", msg: "Order Creation Failed" });
    }
};

export const newReview = async (req: Request, res: Response) => {
    try {
        const { orderId, comment, point } = req.body;
        const userId = req.body.user._id;

        const existingReview = await Order.findOne({ _id: orderId, userId, "review.comment": { $exists: true } });

        if (existingReview) {
            res.status(400).json({ status: "fail", msg: "User has already left a review for this order" });
            return;
        }

        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId, userId },
            {
                $set: {
                    "review.comment": comment,
                    "review.point": point,
                },
            },
            { new: true }
        );

        if (!updatedOrder) {
            res.status(404).json({ status: "fail", msg: "Order not found for the given user" });
            return;
        }

        updateRestaurantAverageRating(updatedOrder.restaurantId);

        res.status(200).json({ status: "success", msg: "Review added successfully", order: updatedOrder });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ status: "fail", msg: "Error adding review" });
    }
}