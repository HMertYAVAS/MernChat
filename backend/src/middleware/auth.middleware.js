import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import {responseAPI} from "../lib/utils.js";


export const protectRoute = async (req,res,next) => {
    try {
        const token = req.cookies.jwt

        if(!token){
            return responseAPI(res,401,"Unauthorized - No Token Provided")
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        if(!decoded){
            return responseAPI(res,401,"Unauthorized - Invalid Token")
        }

        const user = await User.findById(decoded.userId).select("-password")

        if(!user){
            return responseAPI(res,404,"User not found")
        }

        req.user = user;

        next();
    } catch (error) {
        console.log("Error in protectedRoute middleware",error.message)
        responseAPI(res,500,"Internal Server error")
    }
}