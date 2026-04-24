import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL?.trim() || "";
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, "").replace(/\/api$/, "");

const axiosInstance = axios.create({
  baseURL: normalizedBaseUrl,
  withCredentials: true,
});

export default axiosInstance;
