"use client";
import { CustomBreadcrumbs } from "@/components/CustomBreadcrumbs";
import { ProjectInformation } from "./ProjectInformation";
import { ProjectDocuments } from "./ProjectDocuments";
import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/Message";

export const Page = () => {
  const { id } = useParams();

  const {
    data,
    error: queryError,
    isLoading: queryLoading,
    refetch,
  } = useQuery({
    queryKey: ["projectDetail", id],
    queryFn: () => fetch(`/api/proyectos/${id}`).then((res) => res.json()),
    enabled: !!id, // only run the query if id is available
  });

  const {
    data: filesData,
    refetch: filesRefetch,
    error: filesError,
    isLoading: filesLoading,
  } = useQuery({
    queryKey: ["listFiles", id],
    queryFn: () =>
      fetch(`/api/s3/list-objects?folder=${id}`).then((res) => res.json()),
  });

  const handleProjectUpdate = async (formData) => {
    const response = await fetch(`/api/proyectos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error updating project data");
    }

    refetch(); // Refetch the data after successful update
  };

  return (
    <div className="relative flex flex-col gap-6 p-4 min-h-screen">
      {/* Breadcrumbs */}
      <CustomBreadcrumbs currentPageName={data?.name} />

      {queryLoading && <Loading />}
      {queryError && <ErrorMessage error={queryError} />}

      {data && (
        <>
          <ProjectInformation data={data} onUpdate={handleProjectUpdate} />

          <ProjectDocuments
            filesData={filesData}
            filesLoading={filesLoading}
            filesError={filesError}
            projectId={id}
            onFilesRefetch={filesRefetch}
          />
        </>
      )}
    </div>
  );
};

export default Page;
