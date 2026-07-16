"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function KnowledgeTrainer() {
  const [documents, setDocuments] = useState([]);
  const [url, setUrl] = useState("");
  const [isTraining, setIsTraining] = useState(false);

  const fetchDocs = () => {
    api.get('/admin/automation-studio/knowledge')
      .then(res => {
        if (res.data?.success) setDocuments(res.data.data);
      }).catch(err => console.error(err));
  };

  useEffect(() => {
    fetchDocs();
    const interval = setInterval(fetchDocs, 5000); // Poll for status updates
    return () => clearInterval(interval);
  }, []);

  const handleTrain = async () => {
    if (!url) return toast.error("Please enter a URL");
    setIsTraining(true);
    try {
      const res = await api.post('/admin/automation-studio/knowledge/train/url', { url });
      if (res.data?.success) {
        setUrl("");
        fetchDocs();
        toast.success("Training started successfully");
      } else {
        toast.error("Error: " + (res.data?.error || res.data?.message));
      }
    } catch (e: any) {
      toast.error("Failed to start training: " + (e.response?.data?.error || e.message));
    }
    setIsTraining(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600">
            AI Knowledge Trainer
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Teach your AI Agents by crawling websites and building a RAG Vector Database.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group h-fit">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Train New URL</h2>
            
            <div className="space-y-5 relative z-10">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Website URL</label>
                <input 
                  type="url"
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all shadow-sm bg-gray-50"
                  placeholder="https://techwell.com/courses"
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <button 
                onClick={handleTrain}
                disabled={isTraining}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isTraining ? (
                  <>
                    <span className="animate-spin text-xl">⏳</span>
                    <span>Initializing Crawler...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">🚀</span>
                    <span>Start Training</span>
                  </>
                )}
              </button>
            </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Knowledge Base (Vector DB)</h2>
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <span className="text-5xl mb-4">🧠</span>
              <p>No knowledge indexed yet.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {documents.map((doc: any) => (
                <li key={doc.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl hover:shadow-md transition-all group">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-bold text-gray-800 text-lg truncate mb-1">
                      {doc.title || doc.url}
                    </h3>
                    <a href={doc.url} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline truncate block">
                      {doc.url}
                    </a>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      doc.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      doc.status === 'TRAINING' ? 'bg-yellow-100 text-yellow-700 animate-pulse' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {doc.status}
                    </span>
                    <button className="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-lg opacity-0 group-hover:opacity-100">
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
