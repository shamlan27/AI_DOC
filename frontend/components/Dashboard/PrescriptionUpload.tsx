"use client";

import { useState, useRef } from 'react';

export default function PrescriptionUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (!file) return;
        setUploading(true);

        // Simulate Upload
        setTimeout(() => {
            setUploading(false);
            setStatus('success');
            setTimeout(() => {
                setStatus('idle');
                setFile(null);
            }, 3000);
        }, 2000);
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Prescription</h3>

            <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition cursor-pointer bg-gray-50"
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.jpg,.png"
                    onChange={handleFileChange}
                />

                {file ? (
                    <div className="text-sm">
                        <span className="text-blue-600 font-medium block mb-2">{file.name}</span>
                        <span className="text-gray-400">Click to change</span>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="mx-auto h-12 w-12 text-gray-400">
                            <svg stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="text-sm text-gray-600">
                            <span className="font-medium text-blue-600 hover:text-blue-500">Upload a file</span> or drag and drop
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                    </div>
                )}
            </div>

            <div className="mt-4">
                {status === 'success' ? (
                    <div className="w-full py-2 bg-green-50 text-green-700 rounded-lg text-center text-sm font-medium border border-green-200">
                        Prescription sent successfully!
                    </div>
                ) : (
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className={`w-full py-2 rounded-lg text-white font-medium transition shadow-sm
                ${!file || uploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {uploading ? 'Sending...' : 'Send to Doctor'}
                    </button>
                )}
            </div>
        </div>
    );
}
