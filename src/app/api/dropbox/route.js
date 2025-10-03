// import { dbx } from "@/lib/dbx";
import { Dropbox } from "dropbox";

export async function GET(request) {
  console.log(
    "------------------ now dbx is instantiated here ------------------"
  );

  const dbx = new Dropbox({
    accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  });

  dbx
    .filesListFolder({ path: "" })
    .then(function (response) {
      console.log("we got to the then");
      console.log(response.entries);
    })
    .catch(function (error) {
      console.log(error);
    });

  return Response.json({ message: "Hello from Dropbox API" }, { status: 200 });
}
