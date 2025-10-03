import connectDB from "@/database";
import mongoose from "mongoose";

export const Page = async ({ params }) => {
  const id = await params.id;

  if (!mongoose.isValidObjectId(id))
    return (
      <div className="w-full h-svh flex flex-col items-center justify-center">
        <div className="w-full max-w-lg flex flex-col gap-2 text-center">
          <p className="text-xl">Ganatecnica</p>
          <p>URL invalida</p>
        </div>
      </div>
    );

  await connectDB();

  return (
    <div className="flex flex-col gap-2 p-4">
      <p>{`Personal Id: ${id}`}</p>
    </div>
  );
};

export default Page;
