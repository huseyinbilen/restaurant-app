import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
    _id: mongoose.Types.ObjectId,
    username: string,
    email: string,
    password: string,
    birthday: Date,
    gender: string,
    adress: [{
        openAdress: string,
        location: {
            latitude: string,
            longitude: string
        }
    }],
    createdAt: Date,
    isDeleted: boolean,
}

const UserSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            unique: true,
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
        birthday: {
            type: Date,
            default: Date.now()
        },
        gender: {
            type: String,
            enum: ["Man", "Woman"]
        },
        adress: [{
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
        }],
        createdAt: {
            type: Date,
            default: Date.now()
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
    }
)
const UserModel = mongoose.model<IUser>('User', UserSchema)

export default UserModel;