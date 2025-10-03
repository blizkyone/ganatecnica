"use client";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
// import { axiosBunny } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ErrorMessage from "@/components/Message";
import Loading from "@/components/Loading";
import Image from "next/image";
import { UploadFileComponent } from "@/components/UploadFileComponent";

const getFileS3 = ({ folder, key }) =>
  fetch(`/api/s3/get-one-file?path=${folder}/${key}`).then((res) => res.json());

const listFilesS3 = ({ folder }) =>
  fetch(`/api/s3/list-objects?folder=ganatecnica`).then((res) => res.json());

export default function Dashboard() {
  const [fileUrl, setFileUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    data,
    error,
    refetch,
    isLoading: loading,
  } = useQuery({
    queryKey: ["getFileDbx"],
    queryFn: getFileS3,
    enabled: false, // disable automatic query on component mount
  });

  const {
    data: listData,
    error: listError,
    refetch: listRefetch,
    isLoading: listLoading,
  } = useQuery({
    queryKey: ["listFilesS3"],
    queryFn: listFilesS3,
    enabled: false, // disable automatic query on component mount
  });

  useEffect(() => {
    if (data?.signedUrl) {
      setFileUrl(data.signedUrl);
    }
    listData && console.log("List Data:", listData);
  }, [data, listData]);

  return (
    <div className="flex flex-col items-center min-h-screen p-24">
      <p>Welcome to the Dashboard</p>
      {error && <ErrorMessage error={error} />}
      {listError && <ErrorMessage error={listError} />}
      {fileUrl && (
        <Image src={fileUrl} alt="Fetched Image" width={500} height={500} />
      )}
      <Button onClick={listRefetch}>
        {isLoading || loading || listLoading ? <Loading /> : "Get File"}
      </Button>
      <LogoutLink>Log out</LogoutLink>
      <UploadFileComponent folder="test" />
    </div>
  );
}
