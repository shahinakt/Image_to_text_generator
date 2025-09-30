import { useState } from "react";
import jsPDF from "jspdf";

function App() {
    const [file, setFile] = useState(null);
    const [text, setText] = useState("");
    const [summary, setSummary] = useState("");
    const [showSummary, setShowSummary] = useState(false); //toggle view
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [lang, setLang] = useState("en"); //default language


    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setText("");
        setSummary("");
        setShowSummary(false);
        setError("");
    };

    const handleUpload = async() => {
        if (!file) return setError("Please upload an image file.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("lang", lang);

    setIsLoading(true);
    setError("");

    
    try {
      const res = await fetch("http://127.0.0.1:8000/extract_text/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Server error!");
      } else {
        setText(data.extracted_text || "No text found.");
        setSummary(data.summary || "Summary unavailable.");
      }
    } catch (err) {
      console.error(err);
      setError("Network or server error.");
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
        
        // Set page dimensions and margins
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const maxLineWidth = pageWidth - 2 * margin;
        const lineHeight = 10;
        
        // Split text into lines that fit within page width
        const lines = doc.splitTextToSize(content, maxLineWidth);
        
        let currentY = margin;
        
        // Add lines to PDF, creating new pages when necessary
        lines.forEach((line, index) => {
            // Check if we need a new page
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
        // Clear all states to start fresh
        setFile(null);
        setText("");
        setSummary("");
        setShowSummary(false);
        setError("");
        setIsLoading(false);
        
        // Clear the file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    return (
    <div className="bg-gradient">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1>
            Image to Text Generator
          </h1>
          <p>
            Upload any image and extract text using advanced OCR technology with AI-powered summarization
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="privacy-notice">
          <div className="privacy-content">          
            <h3>100% Privacy Focused & Free to Use</h3>
            <div className="privacy-features">
              <span className="feature-badge">No Login Required</span>
              <span className="feature-badge">No Registration</span>
              <span className="feature-badge">No Ads</span>
              <span className="feature-badge">Privacy Concerned</span>
              <span className="feature-badge">Completely Free</span>
              <span className="feature-badge">No Data Stored</span>
            </div>
            <p className="privacy-description">
              Your images are processed securely and temporarily. Nothing is saved or stored. 
              Start using immediately - no sign-up hassles!
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="card">
          
          {/* Language Selection */}
          <div className="form-group">
            <label className="form-label">
              Select Language:
            </label>
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="form-select"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
            </select>
          </div>

          {/* File Upload */}
          <div className="form-group">
            <label className="form-label">
              Upload Image:
            </label>
            <input 
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="form-input"
            />
          </div>

          {/* Extract Button */}
          <button 
            onClick={handleUpload}
            disabled={isLoading}
            className="btn"
          >
            {isLoading ? (
              <>
                <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Processing your image...
              </>
            ) : (
              <>
                <span style={{marginRight: '0.5rem'}}></span>
                Extract Text
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="error">
              <span style={{marginRight: '0.5rem'}}>⚠️</span>
              {error}
            </div>
          )}

          {/* Toggle Buttons */}
          {text && (
            <div className="toggle-buttons">
              <button 
                onClick={() => setShowSummary(false)}
                className={`toggle-btn ${!showSummary ? 'active' : ''}`}
              >
                Full Text
              </button>
              <button 
                onClick={() => setShowSummary(true)}
                className={`toggle-btn ${showSummary ? 'active' : ''}`}
              >
                Summary
              </button>
            </div>
          )}

          {/* Text Display */}
          {text && (
            <div className="text-display">
              <div className="text-content">
                <pre>
                  {showSummary ? summary : text}
                </pre>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {text && (
            <div className="action-buttons">
              <button 
                onClick={handleCopy}
                className="btn-copy"
              >
                <span style={{marginRight: '0.5rem'}}></span>
                Copy Text
              </button>
              <button 
                onClick={handleDownload}
                className="btn-download"
              >
                <span style={{marginRight: '0.5rem'}}></span>
                Download PDF
              </button>
              <button 
                onClick={handleReset}
                className="btn-reset"
              >
                <span style={{marginRight: '0.5rem'}}></span>
                Extract Another Image
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="footer">
          <div className="footer-content">
            <p className="footer-text">
              © 2025 Shahina Sareen • AI Powered OCR Technology
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
