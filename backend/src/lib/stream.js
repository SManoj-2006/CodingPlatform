import {StreamChat} from 'stream-chat';
import { ENV } from './env.js';
import {StreamClient} from '@stream-io/node-sdk'
const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_SECRET_KEY;

if(!apiKey || !apiSecret){
    console.error("Stream API or SecretAPi is Missing");
}
export const streamClient = new StreamClient(apiKey,apiSecret);//will be used video calls
export const chatClient = StreamChat.getInstance(apiKey,apiSecret);//used for chat features

export const upsertStreamUser = async(userData) =>{
    try{
        await chatClient.upsertUser(userData)
        console.log("Successfully created user: ",userData);
    }catch(error){
         console.error("Error upserting stream user: ",error);
    }
}

export const deleteStreamUser = async(userId) =>{
    try{
        await chatClient.deleteUser(userId)
        console.log("Successfully deleted user: ",userId);
    }catch(error){
         console.error("Error deleting  stream user: ",error);
    }
}