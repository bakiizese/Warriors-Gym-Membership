import axios from "axios";

const ADDRESS = process.env.EXPO_PUBLIC_ADDRESS;
const URL = `${ADDRESS}/`;
const ApiClient = axios.create({
  baseURL: URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const ApiClientFile = axios.create({
  baseURL: URL,
  timeout: 10000,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export default ApiClient;
