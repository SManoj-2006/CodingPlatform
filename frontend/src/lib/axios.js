import axios from "axios";


const axiosInstance = axios.create({
    baseURL:import.meta.env.VITE_API_URL,
    withCredentials:true //by using this field browser will send cookies to the server automatically in every single request
})

export default axiosInstance;