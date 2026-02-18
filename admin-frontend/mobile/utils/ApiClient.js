import axios from "axios";

const ADDRESS = process.env.EXPO_PUBLIC_ADDRESS;
const URL = `http://${ADDRESS}/`;
let Address = "";

const ApiClient = axios.create({
  baseURL: Address,
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

export const fetchUrl = async () => {
  console.log("in fetch url");
  // const local = checkLocal();
  // if (local) return;
  const warriorsBotUrl =
    "https://api.telegram.org/bot8500601631:AAH1LSJicDMQc1eUoYs9XOcxCtIdIey_w1c/getUpdates";

  try {
    const ngrokUrl = await axios.get(warriorsBotUrl, {
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const messages = ngrokUrl?.data?.result;
    const newest = messages[messages?.length - 1];
    ApiClient.defaults.baseURL = newest?.message?.text;
    ApiClientFile.defaults.baseURL = newest?.message?.text;
    Address = newest?.message?.text;
    console.log("online fetch");
  } catch (err) {
    console.log("ersror", err);
  }
};

export const getAddress = () => {
  return Address;
};

const checkLocal = async () => {
  const localAddress = process.env.EXPO_PUBLIC_ADDRESS;
  try {
    const res = await axios.get(`http://${localAddress}/ping`, {
      timeout: 3000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    if (res.status === 200) {
      Address = `http://${localAddress}`;
      ApiClient.defaults.baseURL = Address;
      ApiClientFile.defaults.baseURL = Address;
      console.log("local fetch");
      return 1;
    }
    return 0;
  } catch (err) {
    return 0;
  }
};

export default ApiClient;
