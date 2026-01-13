import axios from "axios";

const ApiClient = axios.create({
  baseURL: "http://192.168.1.8:3000/",
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default ApiClient;
