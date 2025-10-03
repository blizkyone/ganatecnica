import axios from "axios";

export const axiosBunny = axios.create({
  baseURL: "https://ny.storage.bunnycdn.com",
  headers: {
    "AccessKey": process.env.NEXT_PUBLIC_BUNNY_PASSWORD,
  },
});
