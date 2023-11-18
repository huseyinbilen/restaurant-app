import mongoose, { Schema, Document } from "mongoose";

interface IMenu extends Document {
    _id: mongoose.Types.ObjectId,
    items: [{
        name: string,
        content: string,
        photo: string,
        price: number
    }],
    createdAt: Date,
    isDeleted: boolean,
    restaurantId: mongoose.Types.ObjectId
}

const MenuSchema = new Schema<IMenu>(
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
            photo: {
                type: String,
                default: null
            },
            price: {
                type: Number,
                required: true
            }
            
        }],
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
        }
    }
)
const MenuModel = mongoose.model<IMenu>('Menu', MenuSchema)

export default MenuModel;