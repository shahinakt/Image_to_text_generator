import { useRef, useState } from "react";
import jsPDF from "jspdf";

const API_URL = "http://127.0.0.1:8000/extract_text/";

function App() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState("en");
  const fileInputRef = useRef(null);

  const resetResults = () => {
    setText("");
    setSummary("");
    setShowSummary(false);
    setError("");
  };

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setFile(nextFile);
    resetResults();
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please upload an image file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("lang", lang);

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, { method: "POST", body: formData });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Server error.");
      }

      setText(data.extracted_text || "No text found.");
      setSummary(data.summary || "");
    } catch (err) {
      setError(err.message || "Network or server error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    const content = showSummary ? summary : text;
    if (content) navigator.clipboard.writeText(content);
  };

  const handleDownload = () => {
    const content = showSummary ? summary : text;
    if (!content) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxLineWidth = pageWidth - 2 * margin;
    const lineHeight = 10;
    const lines = doc.splitTextToSize(content, maxLineWidth);

    let currentY = margin;

    lines.forEach((line) => {
      if (currentY + lineHeight > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }

      doc.text(line, margin, currentY);
      currentY += lineHeight;
    });

    doc.save("extracted_text.pdf");
  };

  const handleReset = () => {
    setFile(null);
    resetResults();
    setIsLoading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-gradient">
      <div className="container">
        <div className="header">
          <h1>Image to Text Generator</h1>
          <p>Upload an image to extract text with OCR and optional summarization.</p>
        </div>

        <div className="privacy-notice">
          <div className="privacy-content">
            <h3>100% Privacy Focused & Free</h3>
            <div className="privacy-features">
              <span className="feature-badge">No Login</span>
              <span className="feature-badge">No Registration</span>
              <span className="feature-badge">No Ads</span>
              <span className="feature-badge">Privacy First</span>
              <span className="feature-badge">Completely Free</span>
              <span className="feature-badge">No Data Stored</span>
            </div>
            <p className="privacy-description">
              Images are processed temporarily and never stored.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="form-group">
            <label className="form-label">Select Language:</label>
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="form-select">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Upload Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="form-input"
              ref={fileInputRef}
            />
          </div>

          <button onClick={handleUpload} disabled={isLoading} className="btn">
            {isLoading ? (
              <>
                <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Processing your image...
              </>
            ) : (
              "Extract Text"
            )}
          </button>

          {error && (
            <div className="error">
              <span aria-hidden>⚠️</span>
              <span className="error-text">{error}</span>
            </div>
          )}

          {text && (
            <div className="toggle-buttons">
              <button onClick={() => setShowSummary(false)} className={`toggle-btn ${!showSummary ? "active" : ""}`}>
                Full Text
              </button>
              <button onClick={() => setShowSummary(true)} className={`toggle-btn ${showSummary ? "active" : ""}`}>
                Summary
              </button>
            </div>
          )}

          {text && (
            <div className="text-display">
              <div className="text-content">
                <pre>{showSummary ? summary || "Summary unavailable." : text}</pre>
              </div>
            </div>
          )}

          {text && (
            <div className="action-buttons">
              <button onClick={handleCopy} className="btn-copy">
                Copy Text
              </button>
              <button onClick={handleDownload} className="btn-download">
                Download PDF
              </button>
              <button onClick={handleReset} className="btn-reset">
                Extract Another Image
              </button>
            </div>
          )}
        </div>

        <div className="footer">
          <div className="footer-content">
            <p className="footer-text">© 2025 Shahina Sareen • AI Powered OCR Technology</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
