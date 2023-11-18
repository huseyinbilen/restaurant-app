import mongoose, { Schema, Document } from "mongoose";

interface IRestaurant extends Document {
    _id: mongoose.Types.ObjectId,
    restaurantName: string,
    email: string,
    password: string,
    about: string,
    logo: string,
    branch: {
        branchName: string,
        adress: {
            openAdress: {
                type: String,
                required: true
            },
            location: {
                latitude: {
                    type: Number,
                    required: true
                },
                longitude: {
                    type: Number,
                    required: true
                }
            }
        }
    },
    restaurantType: string,
    createdAt: Date,
    isDeleted: boolean,
}

const RestaurantSchema = new Schema<IRestaurant>(
    {
        restaurantName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        about: {
            type: String,
            required: true
        },
        logo: {
            type: String,
            default: null
        },
        branch: [{
            branchName: {
                type: String,
                required: true
            },
            adress: {
                openAdress: {
                    type: String,
                    required: true
                },
                location: {
                    latitude: {
                        type: Number,
                        required: true
                    },
                    longitude: {
                        type: Number,
                        required: true
                    }
                }
            },
        }],
        restaurantType: {
            type: String,
            enum: ["Fast Food", "Cin Mutfagi", "Turk Mutfagi", "Ev Yemekleri", "Unlu Mamuller"]
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    }
)
const RestaurantModel = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema)

export default RestaurantModel;