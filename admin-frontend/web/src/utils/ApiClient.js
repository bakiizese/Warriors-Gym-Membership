import axios from "axios";

const ADDRESS = import.meta.env.VITE_ADDRESS;
const URL = `${ADDRESS}/`;

const ApiClient = axios.create({
  baseURL: URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default ApiClient;
