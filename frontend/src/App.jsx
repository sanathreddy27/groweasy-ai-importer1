import { useState } from "react";
import Papa from "papaparse";

import UploadBox from "./components/UploadBox";
import PreviewTable from "./components/PreviewTable";
import api from "./services/api";
import CRMTable from "./components/CRMTable";
import SummaryCards from "./components/SummaryCards";
import LoadingSpinner from "./components/LoadingSpinner";
import { Toaster, toast } from "react-hot-toast";
import "./App.css";

const STAGES = [
  { key: "upload", label: "Upload" },
  { key: "preview", label: "Preview" },
  { key: "confirm", label: "Confirm" },
  { key: "extracted", label: "Extracted" },
];

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backendResponse, setBackendResponse] = useState(null);

  const currentStageIndex = backendResponse
    ? 3
    : loading
    ? 2
    : selectedFile
    ? 1
    : 0;

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setBackendResponse(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
      },
      error: () => {
        toast.error("Could not parse this CSV file.");
      },
    });
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Select a CSV file first.");
      return;
    }

    try {
      setLoading(true);
      setBackendResponse(null);
      const start = Date.now();

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await api.post("/api/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setBackendResponse(response.data);

      const end = Date.now();
      toast.success(`Imported in ${((end - start) / 1000).toFixed(1)}s`);
    } catch (error) {
      console.error(error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Import failed. Try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="sheet">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      <header className="titleblock">
        <div>
          <p className="titleblock-name">GrowEasy · Lead Operations</p>
          <h1 className="titleblock-title">CSV Import Manifest</h1>
        </div>
        <dl className="titleblock-meta">
          <div>
            <dt>Engine</dt>
            <dd>Gemini 2.5</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{today}</dd>
          </div>
          <div>
            <dt>Sheet</dt>
            <dd>01 / Import</dd>
          </div>
        </dl>
      </header>

      <main className="card">
        <span className="corner-tl" aria-hidden="true" />
        <span className="corner-tr" aria-hidden="true" />

        <nav className="stages" aria-label="Import progress">
          {STAGES.map((stage, i) => (
            <div
              key={stage.key}
              className={
                "stage" +
                (i === currentStageIndex ? " is-active" : "") +
                (i < currentStageIndex ? " is-done" : "")
              }
            >
              <span className="stage-num">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{stage.label}</span>
            </div>
          ))}
        </nav>

        <UploadBox onFileSelect={handleFileSelect} />

        {selectedFile && (
          <div className="selected-file">
            <span className="label">Selected</span>
            <span>{selectedFile.name}</span>
          </div>
        )}

        <PreviewTable data={csvData} />

        {loading && <LoadingSpinner />}

        {selectedFile && !loading && (
          <div className="confirm-row">
            <button
              className="btn-confirm"
              onClick={handleImport}
              disabled={loading}
            >
              {loading ? "Importing…" : "Confirm import"}
            </button>
          </div>
        )}

        {backendResponse && backendResponse.records?.length > 0 && (
          <>
            <SummaryCards
              imported={backendResponse.totalImported}
              skipped={backendResponse.totalSkipped}
              total={backendResponse.totalRecords}
            />
            <CRMTable records={backendResponse.records} />
          </>
        )}

        {backendResponse && backendResponse.records?.length === 0 && (
          <div className="empty-state">
            <h2>No valid CRM records found</h2>
            <p>
              The uploaded CSV didn't contain a usable email or mobile number
              for any row.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
