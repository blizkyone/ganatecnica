import { Dropbox } from "dropbox";

export const dbx = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
});
