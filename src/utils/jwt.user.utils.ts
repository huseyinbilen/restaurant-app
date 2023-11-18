import jsonwebtoken, { JwtPayload } from "jsonwebtoken"
const secretKey = "TechcareerNodeJSBootcamp"
export const generateToken = (payload:TokenPayload):string => {
    return jsonwebtoken.sign(payload,secretKey,{expiresIn:18000})
}

export const verifyRestaurantToken = (token:string):TokenPayload => {
    return jsonwebtoken.verify(token,secretKey) as TokenPayload
}

export interface TokenPayload {
    _id: string
    username:string
}