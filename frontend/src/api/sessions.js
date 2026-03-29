import { createSession, data } from "react-router";
import axiosInstance from "../lib/axios";

export const sessionApi = {
    createSession:async (data) =>{
        const respose = await axiosInstance.post("/sessions",data)
        return respose.data
    },
    getActiveSessions:async () =>{
        const respose = await axiosInstance.get("/sessions/active",)
        return respose.data
    },

    getMyRecentSessions:async () =>{
        const respose = await axiosInstance.get("/sessions/my-recent",)
        return respose.data
    },

    getSessionById:async (id) =>{
        const respose = await axiosInstance.get(`/sessions/${id}`,)
        return respose.data
    },

    joinSession:async (id) =>{
        const respose = await axiosInstance.get(`/sessions/${id}/join`,)
        return respose.data
    },

    endSession:async (id) =>{
        const respose = await axiosInstance.get(`/sessions/${id}/end`,)
        return respose.data
    },

    getStreamToken:async () =>{
        const respose = await axiosInstance.get(`/chat/token`,)
        return respose.data
    },
}