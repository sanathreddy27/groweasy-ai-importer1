import { useDropzone } from "react-dropzone";

function UploadBox({ onFileSelect }) {
  const onDrop = (acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) return;
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    multiple: false,
    onDrop,
  });

  return (
    <div
      {...getRootProps()}
      className={"upload-zone" + (isDragActive ? " is-active" : "")}
    >
      <input {...getInputProps()} />

      <svg
        className="upload-zone-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path
          d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <h2>Drop CSV file here</h2>
      <p>or click to browse your files</p>
      <p className="hint">CSV only · max 10MB</p>
    </div>
  );
}

export default UploadBox;
