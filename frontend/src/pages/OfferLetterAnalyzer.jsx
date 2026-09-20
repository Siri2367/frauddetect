import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import "../styles/offerletter.css";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

export default function OfferLetterAnalyzer() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState("");

  /* ================= FILE UPLOAD HANDLER ================= */

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const fileType = file.name.split(".").pop().toLowerCase();

    if (fileType === "txt") {
      const reader = new FileReader();
      reader.onload = (event) => {
        setText(event.target.result);
      };
      reader.readAsText(file);
    }

    else if (fileType === "pdf") {
      const reader = new FileReader();
      reader.onload = async function () {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map(item => item.str);
          fullText += strings.join(" ") + "\n";
        }

        setText(fullText);
      };
      reader.readAsArrayBuffer(file);
    }

    else if (fileType === "docx") {
      const reader = new FileReader();
      reader.onload = async function () {
        const arrayBuffer = this.result;
        const result = await mammoth.extractRawText({ arrayBuffer });
        setText(result.value);
      };
      reader.readAsArrayBuffer(file);
    }

    else {
      alert("Unsupported file type. Please upload TXT, PDF or DOCX.");
    }
  };

  /* ================= ANALYZE LOGIC ================= */

  const analyzeLetter = () => {
    let score = 0;
    let reasons = [];

    const redFlags = [
      "registration fee",
      "processing charge",
      "pay before joining",
      "urgent payment",
      "whatsapp only",
      "gmail.com"
    ];

    redFlags.forEach(flag => {
      if (text.toLowerCase().includes(flag)) {
        score += 20;
        reasons.push(`Detected suspicious phrase: "${flag}"`);
      }
    });

    if (!text.includes("Company Address")) {
      score += 15;
      reasons.push("Missing official company address");
    }

    if (!text.includes("Official Email")) {
      score += 15;
      reasons.push("No official company domain email found");
    }

    const risk =
      score > 60 ? "High Risk ⚠️"
      : score > 30 ? "Suspicious ⚠️"
      : "Likely Genuine ✅";

    setResult({ score, risk, reasons });
  };

  return (
    <div className="page">
      <div className="card">
        <h2>AI Offer Letter Analyzer</h2>

        {/* FILE UPLOAD */}
        <div className="upload-box">
          <label className="upload-label">
            Upload File (PDF, DOCX, TXT)
            <input
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={handleFileUpload}
              hidden
            />
          </label>
          {fileName && <p className="file-name">{fileName}</p>}
        </div>

        <textarea
          rows="8"
          placeholder="Or paste Offer Letter Content..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button onClick={analyzeLetter}>
          Analyze Letter
        </button>

        {result && (
          <div className="result-box">
            <h3>{result.risk}</h3>
            <p>Risk Score: {result.score}%</p>

            <ul>
              {result.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}