import React, { useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
registerPlugin(FilePondPluginImagePreview);

export function useFilePond() {
  const [files, setFiles] = useState([]);

  const onUpdateFiles = (fileItems) => {
    // Only update if files really changed to prevent loops
    setFiles((prevFiles) => {
      const newFiles = [...fileItems];
      if (
        prevFiles.length !== newFiles.length ||
        prevFiles.some((f, i) => f.id !== newFiles[i].id)
      ) {
        return newFiles;
      }
      return prevFiles;
    });
  };

  const FilePondComponent = (props) => (
    <FilePond
      files={files}
      onupdatefiles={onUpdateFiles}
      allowMultiple={false}
      name="file"
      labelIdle='Drag & Drop your file or <span class="filepond--label-action">Browse</span>'
      {...props}
    />
  );

  // files state contains FilePond file objects; get the real files as files.map(f => f.file)
  return { files, FilePondComponent };
}
