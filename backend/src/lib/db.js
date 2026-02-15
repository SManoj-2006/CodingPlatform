import mongoose from "mongoose"

import { ENV } from "./env.js"


export const connectDB = async ()=>{
    try{
    const conn = await mongoose.connect(ENV.DB_URL);
    console.log("Connected",conn.connection.host);
    }
    catch(error){
        console.error("Error")
        process.exit(1)
    }
};


