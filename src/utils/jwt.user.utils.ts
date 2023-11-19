import jsonwebtoken, { JwtPayload } from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const secretKey = process.env.JWT_USER as string;
export const generateToken = (payload:TokenPayload):string => {
    return jsonwebtoken.sign(payload,secretKey,{expiresIn:18000})
}

export const verifyUserToken = (token:string):TokenPayload => {
    return jsonwebtoken.verify(token,secretKey) as TokenPayload
}

export interface TokenPayload {
    _id: string
    username:string
}