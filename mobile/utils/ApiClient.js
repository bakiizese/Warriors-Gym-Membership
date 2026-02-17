import axios from "axios";

const ADDRESS = process.env.EXPO_PUBLIC_ADDRESS;
let Address = "";
// const URL = `${ADDRESS}/`;

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
    const messages = ngrokUrl.data.result;
    const newest = messages[messages.length - 1];
    ApiClient.defaults.baseURL = newest.message.text;
    ApiClientFile.defaults.baseURL = newest.message.text;
    Address = newest.message.text;
    // console.log("ADDRESS-", Address);
  } catch (err) {
    console.log("ersror", err);
  }
};

export const getAddress = () => {
  return Address;
};

export default ApiClient;
