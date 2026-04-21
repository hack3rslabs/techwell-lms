"use client";

import React, { useState } from "react";
import axios from "axios";
import { UploadCloud, FileText, Loader2 } from "lucide-react";

export default function ResumeUpload({
  onDataExtracted,
}: {
  onDataExtracted: (data: any) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token") || "";

      // 1. Upload the file
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const fileUrl = uploadRes.data.url;

      // 2. Analyze the uploaded PDF
      const analyzeRes = await axios.post(
        `${API_URL}/resume/analyze`,
        { pdfUrl: fileUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (analyzeRes.data?.data) {
        onDataExtracted(analyzeRes.data.data);
      } else {
        throw new Error("Failed to extract data from resume.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Error analyzing the resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 p-8 bg-white border border-gray-200 rounded-xl shadow-lg flex flex-col items-center">
      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
        <FileText size={32} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Existing Resume</h2>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        Upload your current resume (PDF format). Our AI will analyze it and auto-fill the builder so you can quickly enhance and download a beautiful new version.
      </p>

      <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center transition hover:border-blue-500 bg-gray-50 mb-6">
        <label className="cursor-pointer flex flex-col items-center group">
          <UploadCloud className="w-12 h-12 text-gray-400 group-hover:text-blue-500 mb-3" />
          <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600">
            {file ? file.name : "Click to select or drag and drop a PDF"}
          </span>
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {error && <p className="text-red-500 text-sm mb-4 w-full text-center">{error}</p>}

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center min-w-[200px]"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2" size={20} /> Analyzing...
          </>
        ) : (
          "Extract Information"
        )}
      </button>
    </div>
  );
}
