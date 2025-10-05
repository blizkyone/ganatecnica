"use client";
import { CustomBreadcrumbs } from "@/components/CustomBreadcrumbs";
import { ProjectInformation } from "./ProjectInformation";
import { ProjectDocuments } from "./ProjectDocuments";
import { ProjectPersonal } from "./ProjectPersonal";
import { ProjectDiary } from "./ProjectDiary";
import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/Message";

export const Page = () => {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = React.useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

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

  // Fetch diary entries for the project
  const {
    data: diaryData,
    isLoading: diaryLoading,
    error: diaryError,
    refetch: refetchDiary,
  } = useQuery({
    queryKey: ["projectDiary", id, selectedDate],
    queryFn: () =>
      fetch(`/api/diary/project/${id}?date=${selectedDate}`).then((res) =>
        res.json()
      ),
    enabled: !!id,
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

          <ProjectPersonal
            projectId={id}
            projectData={data}
            onUpdate={refetch}
          />

          <ProjectDiary
            projectId={id}
            projectData={data}
            diaryData={diaryData}
            diaryLoading={diaryLoading}
            diaryError={diaryError}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onDiaryRefetch={refetchDiary}
            onUpdate={refetch}
          />

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
