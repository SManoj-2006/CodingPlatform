import { requireAuth } from "@clerk/express";
import User from "../models/User.js";


export const protectRoute = [
    requireAuth(),
    async (res,req,next) => {
        try {
            const clerkId = req.auth().userId;
            if(!clerkId){
                return res.status(401).json({message:"Unauthorized - Invalid Token"})
            }
            const user  = await User.findOne({clerkId})
            if(!user){
                return res.status(404).json({message:"User not Found"})
            }

            req.user = user;
            next();

        } catch (error) {
            res.status(500).json({message:"Error in protecmiddleware",error})
        }
    }
]