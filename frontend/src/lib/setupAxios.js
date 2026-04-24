import axiosInstance from "./axios";
import { clerk } from "@clerk/clerk-react";

axiosInstance.interceptors.request.use(async (config) => {
  const token = await clerk.session?.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});