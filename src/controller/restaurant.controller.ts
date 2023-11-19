import { Request, Response, NextFunction } from "express"
import * as argon2 from "argon2";
import Restaurant from "../data/restaurant/restaurant.data"
import { generateToken } from "../utils/jwt.restaurant.utils"
import Menu from "../data/menu/menu.data";
import mongoose from "mongoose";
import Order from "../data/order/order.data";
import User from "../data/user/user.data";
import multer, { Multer } from 'multer';
const AWS = require('aws-sdk');

export const register = async (req: Request, res: Response, next: NextFunction) => {
    // Password Encryption
    req.body.password = await argon2.hash(req.body.password);

    const { restaurantName, about, password, email, branch } = req.body;

    try {
        Restaurant.create({restaurantName, about, password, email, branch})
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

export const updateLogo = async (req: Request, res: Response) => {
    try {
        let restaurant = await Restaurant.findById(req.body.restaurant._id);
        if(restaurant) {
            const restaurantName = req.body.restaurant.restaurantName;
            const file = req.file;
    
    
            if (!file) {
                return res.status(400).json({ status: "fail", msg: "No file provided" });
            }
    
            const s3 = new AWS.S3({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            });
      
            // Setting up S3 upload parameters
            const params = {
                Bucket: process.env.LOGO_BUCKET_NAME,
                Key: `${restaurantName}-logo.jpg`, // File name you want to save as
                Body: file.buffer
            };
      
            // Uploading file to the bucket
            const result = await s3.upload(params).promise();
            restaurant.logo = result.location;
            restaurant.save();

            res.json({ status: "success", msg: "Photo updated successfully" });
        }
        res.status(500).json({ status: "fail", msg: "User Not Found" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "fail", msg: "Photo update failed" });
    }
}

export const getRestaurantProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const restaurantId = req.body.restaurant._id;

        const restaurant = await Restaurant.findById(restaurantId, { password: 0 });

        if (!restaurant) {
            res.status(404).json({ status: "fail", msg: "Restaurant not found" });
            return;
        }

        res.status(200).json({ status: "success", msg: "Restaurant profile retrieved successfully", restaurant });
    } catch (error) {
        console.error("Error getting restaurant profile:", error);
        res.status(500).json({ status: "fail", msg: "Error getting restaurant profile" });
    }
};

export const updateRestaurantProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const restaurantId = req.body.restaurant._id;
        
        req.body.password = await argon2.hash(req.body.password);

        const { restaurantName, email, about, logo, branch, restaurantType, password } = req.body;

        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            restaurantId,
            { restaurantName, email, about, logo, branch, restaurantType, password },
            { new: true }
        );

        if (!updatedRestaurant) {
            res.status(404).json({status: "fail",msg: "Restaurant not found" });
            return;
        }

        res.status(200).json({ status: "success", msg: "Restaurant profile updated successfully", restaurant: updatedRestaurant });
    } catch (error) {
        console.error("Error updating restaurant profile:", error);
        res.status(500).json({ status: "fail", msg: "Error updating restaurant profile" });
    }
};

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
        const items = req.body.items;
        const restaurantId = req.body.restaurant._id;

        let existingMenu = await Menu.findOne({ restaurantId });

        if (existingMenu) {

            await Promise.all(items.map(async (item: { photo: any; }) => {
                if (item.photo) {
                    const photoUrl = await uploadPhotoToS3(item.photo);
                    item.photo = photoUrl;
                }
            }));

            existingMenu.items.push(...items);
            await existingMenu.save();

            res.status(200).json({ status: "success", msg: "Menu Updated Successfully", menu: existingMenu });
        } else {
            const menu = await Menu.create({ restaurantId, items });

            res.status(200).json({ status: "success", msg: "Menu Created Successfully", menu });
        }
    } catch (error) {
        console.error("Menu update/creation failed:", error);
        res.status(500).json({ status: "fail", msg: "Menu Update/Creation Failed" });
    }
};

export const findRestaurantsByMenuKey = async (req: Request, res: Response) => {
    try {
        const key = req.body.key;
        const userId = req.body.user._id;

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ status: 'fail', msg: 'User not found' });
            return;
        }

        const userLocation = user.address && user.address.length > 0 ? user.address[0].location : null;

        if (!userLocation) {
            res.status(404).json({ status: 'fail', msg: 'User location not found' });
            return;
        }

        const menus = await Menu.find({ 'items.content': { $regex: key, $options: 'i' } });

        const restaurantIds = menus.flatMap(menu => menu.restaurantId);

        await Restaurant.collection.createIndex({ 'branch.address.location': '2dsphere' });

        const sortedRestaurants = await Restaurant.find({
            _id: { $in: restaurantIds },
            'branch.address.location': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [userLocation.longitude, userLocation.latitude]
                    }
                }
            }
        }).limit(5);

        res.status(200).json({ status: 'success', msg: 'Restaurants found successfully', restaurants: sortedRestaurants });
    } catch (error) {
        console.error('Error finding restaurants:', error);
        res.status(500).json({ status: 'fail', msg: 'Error finding restaurants' });
    }
};

export const createMultipleMenuItems = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const items = req.body.items;
        const restaurantId = req.body.restaurant._id;

        let existingMenu = await Menu.findOne({ restaurantId }).session(session);

        if (existingMenu) {
            existingMenu.items.push(...items);
            await existingMenu.save();

            await session.commitTransaction();
            res.status(200).json({ status: "success", msg: "Menu Updated Successfully", menu: existingMenu });
        } else {
            const menu = await Menu.create([{ restaurantId, items }], { session });

            await session.commitTransaction();
            res.status(200).json({ status: "success", msg: "Menu Created Successfully", menu: menu[0] });
        }
    } catch (error) {
        await session.abortTransaction();
        console.error("Menu update/creation failed:", error);
        res.status(500).json({ status: "fail", msg: "Menu Update/Creation Failed" });
    } finally {
        session.endSession();
    }
};

export const getMaleReviewersByAge = async (req: Request, res: Response) => {
    try {
        const last20MaleReviewers = await Order.aggregate([
            {
                $match: {
                    "review.comment": { $exists: true },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: "$user",
            },
            {
                $match: {
                    "user.gender": "male",
                },
            },
            {
                $sort: { "user.birthday": 1 },
            },
            {
                $limit: 20,
            },
            {
                $project: {
                    userId: "$userId",
                    username: "$user.username",
                    birthday: { $year: "$user.birthday" }
                },
            },
        ]);

        res.status(200).json({
            status: "success",
            msg: "Last 20 male reviewers with usernames sorted by age found successfully",
            reviewers: last20MaleReviewers,
        });
    } catch (error) {
        console.error("Error getting top male reviewers:", error);
        res.status(500).json({ status: "fail", msg: "Error getting top male reviewers" });
    }
};

export const getFilteredRestaurants = async (req: Request, res: Response): Promise<void> => {
    try {
        const specialRestaurants = await Restaurant.find({
            $or: [
                { restaurantType: { $in: ["Fast Food", "Ev Yemekleri"] } },
                { about: { $regex: /fast/i } },
            ],
        }, { _id: 0, restaurantName: 1, restaurantType: 1, about: 1 });

        res.status(200).json({
            status: "success",
            msg: "Special restaurants found successfully",
            restaurants: specialRestaurants,
        });    } catch (error) {
        console.error("Error getting filtered restaurants:", error);
        res.status(500).json({ status: "fail", msg: "Error getting filtered restaurants" });
    }
};

export const getRestaurantsByAverageRating = async (req: Request, res: Response): Promise<void> => {
    try {
        const { pageIndex = "1", pageSize = "20" } = req.query;

        const skip = (parseInt(pageIndex as string) - 1) * parseInt(pageSize as string);

        const sortedRestaurants = await Restaurant.aggregate([
            {
                $match: {
                    "averageRating": { $exists: true },
                },
            },
            {
                $sort: { averageRating: -1 },
            },
            {
                $skip: skip,
            },
            {
                $limit: parseInt(pageSize as string),
            },
        ]);

        const nextPageLink = `localhost:8000/restaurant/filter/most-voted-restaurants?pageIndex=${parseInt(pageIndex as string) + 1}&pageSize=${pageSize}`;

        res.header("Link", `<${nextPageLink}>; rel="next"`);
        res.status(200).json({
            status: "success",
            msg: "Restaurants sorted by average rating successfully",
            restaurants: sortedRestaurants,
        });
    } catch (error) {
        console.error("Error getting sorted restaurants:", error);
        res.status(500).json({ status: "fail", msg: "Error getting sorted restaurants" });
    }
};

export const updateRestaurantAverageRating = async (restaurantId: mongoose.Types.ObjectId) => {
    try {
        const averageRating = await Order.aggregate([
            {
                $match: {
                    restaurantId: restaurantId,
                    "review.point": { $exists: true },
                },
            },
            {
                $group: {
                    _id: "$restaurantId",
                    averageRating: { $avg: "$review.point" },
                },
            },
        ]);

        if (averageRating.length > 0) {
            const updatedRestaurant = await Restaurant.findByIdAndUpdate(
                restaurantId,
                { $set: { averageRating: averageRating[0].averageRating } },
                { new: true }
            );
        } else {
            console.log(`No reviews found for restaurant ${restaurantId}`);
        }
    } catch (error) {
        console.error(`Error updating average rating for restaurant ${restaurantId}:`, error);
    }
};

const uploadPhotoToS3 = async (photo: any): Promise<string> => {
    try {
        const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });

        // Setting up S3 upload parameters
        const params = {
            Bucket: process.env.PHOTO_BUCKET_NAME, // Değiştirilecek
            Key: `${Date.now()}-menu-photo.jpg`, // Dosya adını dilediğiniz gibi değiştirin
            Body: photo.buffer
        };

        // Uploading file to the bucket
        const result = await s3.upload(params).promise();

        return result.Location;
    } catch (error) {
        console.error("Photo upload failed:", error);
        throw error;
    }
};