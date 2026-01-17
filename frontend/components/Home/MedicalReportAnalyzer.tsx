"use client";

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import api from '../../services/api';
import React from 'react';

// Simple Markdown component since we can't easily install new packages
const MarkdownRenderer = ({ content }: { content: string }) => {
    // Basic formatting for headers and bold text
    const formatLine = (line: string, index: number) => {
        if (line.startsWith('## ')) return <h3 key={index} className="text-xl font-bold text-blue-300 mt-4 mb-2">{line.replace('## ', '')}</h3>;
        if (line.startsWith('### ')) return <h4 key={index} className="text-lg font-semibold text-white mt-3 mb-1">{line.replace('### ', '')}</h4>;
        if (line.startsWith('**') && line.endsWith('**')) return <p key={index} className="font-bold text-white my-2">{line.replace(/\*\*/g, '')}</p>;
        if (line.startsWith('- ')) return <li key={index} className="ml-4 list-disc text-gray-300">{line.replace('- ', '')}</li>;

        // Handle bolding within lines
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
            <p key={index} className="text-gray-300 mb-2 leading-relaxed">
                {parts.map((part, i) =>
                    part.startsWith('**') && part.endsWith('**')
                        ? <strong key={i} className="text-white font-semibold">{part.replace(/\*\*/g, '')}</strong>
                        : part
                )}
            </p>
        );
    };

    return (
        <div className="space-y-1">
            {content.split('\n').map((line, i) => formatLine(line, i))}
        </div>
    );
};

export default function MedicalReportAnalyzer() {
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setError('File size exceeds 10MB limit.');
            return;
        }

        setIsUploading(true);
        setError(null);
        setAnalysis(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            setIsUploading(false);
            setIsAnalyzing(true);

            const response = await api.post('/analyze-report', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setAnalysis(response.data.analysis);
            } else {
                setError(response.data.message || 'Analysis failed.');
            }
        } catch (err: any) {
            console.error('Analysis Error:', err);
            setError(err.response?.data?.message || 'Failed to analyze report. Please try again.');
        } finally {
            setIsUploading(false);
            setIsAnalyzing(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <section id="report-analyzer" className="py-24 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[80px]"></div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="glass-panel p-1 rounded-3xl border border-white/10 shadow-2xl">
                    <div className="bg-black/40 rounded-[22px] p-8 md:p-12">

                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
                                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                                Powered by Google Gemini
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4"> Medical Report <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Analyzer</span></h2>
                            <p className="text-gray-400 max-w-2xl mx-auto">
                                Upload your lab reports for an instant AI-powered summary. Understand your health metrics in simple language.
                            </p>
                        </div>

                        {!analysis ? (
                            <div className="max-w-xl mx-auto">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                />
                                <div
                                    className={`border-2 border-dashed border-white/20 rounded-2xl p-10 text-center hover:bg-white/5 hover:border-blue-500/50 transition-all cursor-pointer group ${isAnalyzing ? 'pointer-events-none opacity-80' : ''}`}
                                    onClick={triggerUpload}
                                >
                                    <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                        {isUploading || isAnalyzing ? (
                                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                                        ) : (
                                            <Upload className="w-8 h-8 text-blue-400" />
                                        )}
                                    </div>

                                    {isUploading ? (
                                        <p className="text-lg font-medium text-white">Uploading file...</p>
                                    ) : isAnalyzing ? (
                                        <div className="space-y-2">
                                            <p className="text-lg font-medium text-white">Gemini AI is analyzing...</p>
                                            <p className="text-sm text-blue-300 animate-pulse">Extracting medical insights...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-lg font-medium text-white mb-2">Click to upload Report</p>
                                            <p className="text-sm text-gray-500">PDF, JPG, or PNG (max. 10MB)</p>
                                        </>
                                    )}
                                </div>
                                {error && (
                                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="animate-fade-in max-w-4xl mx-auto">
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                                    <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-500/10 rounded-lg">
                                                <CheckCircle className="w-6 h-6 text-green-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-white">Analysis Complete</h3>
                                                <p className="text-sm text-gray-400">Generated by AI based on your report</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setAnalysis(null)}
                                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="prose prose-invert max-w-none">
                                        <MarkdownRenderer content={analysis} />
                                    </div>
                                </div>

                                <div className="text-center mt-8">
                                    <button
                                        onClick={() => setAnalysis(null)}
                                        className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
                                    >
                                        Analyze Another Report
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Disclaimer */}
                        <div className="mt-8 flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-200/80 text-xs sm:text-sm">
                            <AlertCircle className="w-5 h-5 shrink-0 text-yellow-500" />
                            <p>
                                <strong>Disclaimer:</strong> This tool is for informational purposes only and is AI-generated.
                                It is not a substitute for professional medical advice. Always consult your doctor for accurate diagnosis and treatment.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
