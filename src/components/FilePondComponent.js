import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";

registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateSize);

export function FilePondComponent({ files, setFiles, ...props }) {
  return (
    <FilePond
      files={files}
      onupdatefiles={setFiles}
      allowMultiple={false}
      labelIdle='Drag & Drop your file or <span class="filepond--label-action">Browse</span>'
      {...props}
    />
  );
}
