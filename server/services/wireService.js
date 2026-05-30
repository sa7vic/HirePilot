import axios from "axios";

const BASE_URL = "https://api.anakin.io/v1";

export function getWireClient() {
  if (!process.env.ANAKIN_API_KEY) {
    throw new Error("ANAKIN_API_KEY is not set");
  }

  return axios.create({
    baseURL: BASE_URL,
    headers: {
      "X-API-Key": process.env.ANAKIN_API_KEY,
      "Content-Type": "application/json",
    },
  });
}
