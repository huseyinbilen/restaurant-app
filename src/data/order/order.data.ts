import mongoose, { Schema, Document } from "mongoose";

interface IOrder extends Document {
    _id: mongoose.Types.ObjectId,
    items: [{
        name: string,
        content: string,
        photo: string,
        price: number
    }],
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
    review: {
        comment: string,
        point: number
    }
    totalPrice: number,
    createdAt: Date,
    isDeleted: boolean,
    restaurantId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
}

const OrderSchema = new Schema<IOrder>(
    {
        items: [{
            name: {
                type: String,
                unique: true,
                required: true
            },
            content: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }],
        totalPrice: {
            type: Number,
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
        review: {
            comment: {
                type: String,
                default: null
            },
            point: {
                type: Number,
                min: 1,
                max: 5
            }
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'Restaurant'
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }
)
const OrderModel = mongoose.model<IOrder>('Order', OrderSchema)

export default OrderModel;