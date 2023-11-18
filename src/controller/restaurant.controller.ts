import { Request, Response, NextFunction } from "express"
import * as argon2 from "argon2";
import Restaurant from "../data/restaurant/restaurant.data"
import { generateToken } from "../utils/jwt.restaurant.utils"
import Menu from "../data/menu/menu.data";
import mongoose from "mongoose";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    // Password Encryption
    req.body.password = await argon2.hash(req.body.password);

    const { restaurantname, password, email, birthday, gender, address } = req.body;

    try {
        Restaurant.create({restaurantname, password, email, birthday, gender, address})
            .then(result => {
                res.status(200).json({
                    status: "success",
                    msg: "Restaurant Created Successfully"
                });
            })
            .catch(exception => {
                console.error(exception);
                res.status(500).json({
                    status: "fail",
                    msg: "Restaurant Creation Failed"
                });
            });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "fail", msg: "Restaurant Creation Failed" });
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const value = await Restaurant.findOne({ email: req.body.email, isDeleted: false });

        if (value) {
            const passwordMatches = await argon2.verify(value.password, req.body.password);

            if (passwordMatches) {
                const jwtToken = await generateToken({ _id: value._id.toString(), restaurantName: value.restaurantName });
                res.json({ token: jwtToken });
            } else {
                res.status(500).json({ status: "fail", msg: "Restaurant Not Verified" });
            }
        } else {
            res.status(401).json({ status: "fail", msg: "Invalid restaurantname or password" });
        }
    } catch (exception) {
        console.error(exception);
        res.status(500).json({ status: "fail", msg: "Restaurant Login Failed" });
    }
}

export const deleteRestaurant = async (req: Request, res: Response, next: NextFunction) => {
    Restaurant.updateOne({ restaurantname: req.body.restaurantname }, { isDeleted: true })
        .then((result) => {
            console.log(result);

            if (result) {
                res.status(200).json({ status: "success", msg: "Restaurant Delete Successfully" });
            } else {
                res.status(500).json({ status: "success", msg: "Restaurant Delete Failed" });
            }
        })
        .catch((exception) => {
            console.error(exception);
            res.status(500).json({ status: "fail", msg: "Restaurant Delete Failed" });
        })
}

export const addMenu = async (req: Request, res: Response) => {
    try {
        const { restaurantId, items } = req.body;

        const menu = await Menu.create({
            restaurantId,
            items,
        });

        res.status(200).json({
            status: "success",
            msg: "Menu Created Successfully",
            menu,
        });
    } catch (error) {
        console.error("Menu creation failed:", error);
        res.status(500).json({
            status: "fail",
            msg: "Menu Creation Failed",
        });
    }
};

export const createMultipleMenuItems = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { restaurantId, menuItems } = req.body;

        const createdMenuItems = await Menu.updateOne(
            { restaurantId },
            { $push: { items: { $each: menuItems } } },
            { session, upsert: true, new: true }
        );

        await session.commitTransaction();

        res.status(200).json({
            status: "success",
            msg: "Multiple menu items created successfully",
            createdMenuItems,
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("Error creating multiple menu items:", error);
        res.status(500).json({
            status: "fail",
            msg: "Error creating multiple menu items",
        });
    } finally {
        session.endSession();
    }
};