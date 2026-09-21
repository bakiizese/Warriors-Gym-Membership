import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";

const ADDRESS = process.env.EXPO_PUBLIC_ADDRESS;
const URL = `${ADDRESS}/`;

let signingOut = false;

// The API answers 401 for a missing, expired or rejected token, and every
// screen is about to fail the same way. End the session once, here, and send
// the admin back to sign in. (Wrong passwords come back as 400/404, not 401.)
const endSessionOn401 = async (error) => {
  if (error.response?.status === 401 && !signingOut) {
    signingOut = true;
    try {
      await AsyncStorage.clear();
      router.replace({ pathname: "/AuthPage", params: { path: 2 } });
    } finally {
      signingOut = false;
    }
  }
  return Promise.reject(error);
};

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

ApiClient.interceptors.response.use(undefined, endSessionOn401);
ApiClientFile.interceptors.response.use(undefined, endSessionOn401);

export default ApiClient;
