import axios from "axios";

import { ADDRESS } from "./config";
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
