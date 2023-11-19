import { Request, Response, NextFunction } from "express"
import { verifyUserToken } from "../src/utils/jwt.user.utils"
import { verifyRestaurantToken } from "../src/utils/jwt.restaurant.utils"

export const authtenticateForUser = (req:Request, res:Response, next:NextFunction) =>{
    const jwtToken = req.headers.authorization as string
    if(jwtToken) {
        const token = jwtToken.split(' ')[1];
        const verifyTokenResult = verifyUserToken(token)
        if(verifyTokenResult){
            req.body.user = verifyTokenResult;
            next()
        }else{
            res.sendStatus(500)
        }
    }
}

export const authtenticateForRestaurant = (req:Request, res:Response, next:NextFunction) =>{
    const jwtToken = req.headers.authorization as string
    if(jwtToken) {
        const token = jwtToken.split(' ')[1];
        const verifyTokenResult = verifyRestaurantToken(token)
        if(verifyTokenResult){
            req.body.restaurant = verifyTokenResult;
            next()
        }else{
            res.sendStatus(500)
        }
    }
}