import React, { useState } from "react";
import api from "../services/api";
import { UploadCloud, FileSpreadsheet, Archive, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const BulkUpload = () => {
    const [excelFile, setExcelFile] = useState(null);
    const [zipFile, setZipFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!excelFile || !zipFile) {
            setError("Please select both Excel and ZIP files.");
            return;
        }

        setIsUploading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append("excel", excelFile);
        formData.append("zip", zipFile);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post("http://localhost:8000/api/admin/products/bulk-upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || "Upload failed. Please check file formats.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Bulk Product Upload</h1>
                <p className="text-gray-500 mt-2 font-medium">Efficiently populate your catalog using Excel and ZIP archives</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
                <div className="bg-white p-8 rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-6">
                        <FileSpreadsheet size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">1. Prepare Metadata</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-6">
                        Download our template and fill in product details like Name, SKU, Category, and Price.
                    </p>
                    <button 
                        onClick={async () => {
                            try {
                                const response = await api.get("/products/template-download", {
                                    responseType: 'blob'
                                });
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', 'product_upload_template.xlsx');
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                            } catch (err) {
                                console.error("Download failed", err);
                            }
                        }}
                        className="text-primary-600 font-bold text-sm bg-primary-50 px-6 py-3 rounded-xl hover:bg-primary-100 transition-colors w-full"
                    >
                        Download Template
                    </button>
                </div>

                <div className="bg-white p-8 rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                        <Archive size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">2. Gather Media</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-6">
                        Create a ZIP folder with 'thumbnails' and 'gallery' subfolders containing your product images.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest">
                        <CheckCircle2 size={14} /> ZIP Format Required
                    </div>
                </div>
            </div>

            <form onSubmit={handleUpload} className="bg-white rounded-3xl border shadow-xl overflow-hidden">
                <div className="p-8 border-b bg-gray-50/50">
                    <h2 className="text-lg font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                        <UploadCloud size={18} /> Upload Files
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Excel File (.xlsx)</label>
                            <input 
                                type="file" 
                                accept=".xlsx, .xls"
                                onChange={(e) => setExcelFile(e.target.files[0])}
                                className="w-full bg-white border-2 border-dashed border-gray-200 rounded-2xl p-4 text-sm font-medium focus:border-primary-500 transition-colors cursor-pointer hover:bg-gray-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Images ZIP (.zip)</label>
                            <input 
                                type="file" 
                                accept=".zip"
                                onChange={(e) => setZipFile(e.target.files[0])}
                                className="w-full bg-white border-2 border-dashed border-gray-200 rounded-2xl p-4 text-sm font-medium focus:border-blue-500 transition-colors cursor-pointer hover:bg-gray-50"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-8 flex items-center justify-between bg-white">
                    <div className="text-sm text-gray-500 font-medium italic">
                        * Ensure category names in Excel match exactly with existing categories.
                    </div>
                    <button 
                        disabled={isUploading || !excelFile || !zipFile}
                        className={`px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary-200 transition-all flex items-center gap-3 ${
                            isUploading || !excelFile || !zipFile
                                ? "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"
                                : "bg-primary-600 text-white hover:bg-primary-700 hover:-translate-y-1 active:scale-95"
                        }`}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} /> Processing...
                            </>
                        ) : (
                            "Start Bulk Upload"
                        )}
                    </button>
                </div>
            </form>

            {error && (
                <div className="mt-8 p-6 bg-red-50 border-2 border-red-100 rounded-3xl flex items-center gap-4 text-red-600 font-bold">
                    <AlertCircle />
                    <p>{error}</p>
                </div>
            )}

            {result && (
                <div className="mt-8 bg-white rounded-3xl border shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-8 border-b bg-green-50/50 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900">Upload Summary</h3>
                            <p className="text-green-600 font-bold mt-1 uppercase text-xs tracking-widest">Completed Successfully</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-center bg-white px-6 py-3 rounded-2xl border flex flex-col">
                                <span className="text-2xl font-black text-gray-900">{result.success_count}</span>
                                <span className="text-[10px] uppercase font-black text-gray-400">Success</span>
                            </div>
                            <div className="text-center bg-white px-6 py-3 rounded-2xl border flex flex-col">
                                <span className="text-2xl font-black text-red-500 uppercase">{result.failed_count}</span>
                                <span className="text-[10px] uppercase font-black text-gray-400">Failed</span>
                            </div>
                        </div>
                    </div>

                    {result.error_details && result.error_details.length > 0 && (
                        <div className="p-8 bg-white">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Error Logs</h4>
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-4 custom-scrollbar">
                                {result.error_details.map((err, i) => (
                                    <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border text-sm">
                                        <div className="bg-red-100 text-red-600 px-3 py-1 rounded-lg font-black text-xs uppercase tracking-tighter">
                                            Row {err.row}
                                        </div>
                                        <p className="text-gray-600 font-medium py-1">{err.error}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BulkUpload;
