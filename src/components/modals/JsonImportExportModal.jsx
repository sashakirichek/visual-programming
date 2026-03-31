import { useState } from "react";
import { useFlowStore } from "../../store/flowStore";

export default function JsonImportExportModal({ onClose }) {
  const exportToJson = useFlowStore((s) => s.exportToJson);
  const importFromJson = useFlowStore((s) => s.importFromJson);
  const [tab, setTab] = useState("export");
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState("");

  const jsonContent = exportToJson();

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonContent).then(() => {
      setMessage("Copied to clipboard!");
      setTimeout(() => setMessage(""), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flow.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const result = importFromJson(importText);
    if (result.success) {
      setMessage("Import successful!");
      setTimeout(() => {
        setMessage("");
        onClose();
      }, 1000);
    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setImportText(evt.target.result || "");
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>JSON IMPORT / EXPORT</h2>
          <button className="modal-close" onClick={onClose}>
            X
          </button>
        </div>

        <div className="modal-tabs">
          <button className={`modal-tab ${tab === "export" ? "active" : ""}`} onClick={() => setTab("export")}>
            Export
          </button>
          <button className={`modal-tab ${tab === "import" ? "active" : ""}`} onClick={() => setTab("import")}>
            Import
          </button>
        </div>

        {tab === "export" && (
          <div className="modal-body">
            <textarea className="json-textarea" readOnly value={jsonContent} rows={15} />
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleCopy}>
                COPY
              </button>
              <button className="btn btn-secondary" onClick={handleDownload}>
                DOWNLOAD
              </button>
            </div>
          </div>
        )}

        {tab === "import" && (
          <div className="modal-body">
            <div className="import-file-row">
              <label className="btn btn-secondary">
                CHOOSE FILE
                <input type="file" accept=".json" onChange={handleFileImport} hidden />
              </label>
              <span className="import-or">or paste JSON below</span>
            </div>
            <textarea
              className="json-textarea"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='{"nodes": [], "edges": [], "modules": {}}'
              rows={12}
            />
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleImport} disabled={!importText.trim()}>
                IMPORT
              </button>
            </div>
          </div>
        )}

        {message && <div className="modal-message">{message}</div>}
      </div>
    </div>
  );
}
