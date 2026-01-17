"use client";

import { useState, useEffect } from 'react';
import { reportService, MedicalReport } from '../../services/reportService';
import { doctorService, Doctor } from '../../services/doctorService'; // Need doctor list for dropdown

export default function ReportsTab() {
    const [reports, setReports] = useState<MedicalReport[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [view, setView] = useState<'list' | 'upload'>('list');
    const [isLoading, setIsLoading] = useState(true);

    // Upload State
    const [selectedDoctorName, setSelectedDoctorName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [reportsData, doctorsData] = await Promise.all([
                reportService.getReports(),
                doctorService.getAllDoctors()
            ]);
            setReports(reportsData);
            setDoctors(doctorsData);
        } catch (error) {
            console.error("Failed to load reports/doctors", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !selectedDoctorName) {
            alert("Please select a doctor and a file.");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('doctor_name', selectedDoctorName);
            formData.append('file', file);
            formData.append('report_date', reportDate);
            formData.append('report_type', 'General Report'); // Can be dynamic

            await reportService.uploadReport(formData);

            alert("Report uploaded successfully!");
            setFile(null);
            setSelectedDoctorName('');
            setView('list');
            loadData(); // Refresh list
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload report.");
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) return <div className="text-center py-10 text-gray-400">Loading reports...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Medical Reports</h2>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setView('list')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        My Reports
                    </button>
                    <button
                        onClick={() => setView('upload')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'upload' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Upload New
                    </button>
                </div>
            </div>

            {view === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map((report) => (
                        <div key={report.id} className="glass-card p-5 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-lg text-2xl">
                                    📄
                                </div>
                                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md">{new Date(report.report_date).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-white font-bold truncate mb-1" title={report.doctor_name}>{report.doctor_name}</h3>
                            <p className="text-xs text-gray-400 mb-4">{report.report_type}</p>
                            <div className="flex gap-2">
                                <a
                                    href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${report.file_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-blue-400 text-xs font-bold rounded-lg transition-colors text-center"
                                >
                                    View
                                </a>
                                <button className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors">
                                    ⬇️
                                </button>
                            </div>
                        </div>
                    ))}
                    {/* Add New Placeholer */}
                    <button
                        onClick={() => setView('upload')}
                        className="glass-card p-5 rounded-2xl border border-white/10 border-dashed hover:border-blue-500/50 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-blue-400 h-full min-h-[180px]"
                    >
                        <span className="text-4xl">+</span>
                        <span className="font-medium">Upload New Report</span>
                    </button>
                </div>
            ) : (
                <div className="glass-card p-6 md:p-10 rounded-3xl border border-white/10">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Select Prescribing Doctor</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-blue-500 transition-colors"
                                    value={selectedDoctorName}
                                    onChange={(e) => setSelectedDoctorName(e.target.value)}
                                >
                                    <option value="" disabled>-- Select Doctor --</option>
                                    {doctors.map(doc => (
                                        <option key={doc.id} value={doc.name}>{doc.name} - {doc.specialization}</option>
                                    ))}
                                    <option value="Other">Other / External Doctor</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    ▼
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Select the doctor who prescribed or will review this report.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Report Date</label>
                            <input
                                type="date"
                                value={reportDate}
                                onChange={(e) => setReportDate(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Upload Report File</label>
                            <div className={`border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-blue-500/50 hover:bg-white/5 transition-all cursor-pointer relative ${file ? 'border-green-500/50 bg-green-500/5' : ''}`}>
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                                <div className="text-4xl mb-4">{file ? '✅' : '📁'}</div>
                                <p className="text-gray-300 font-medium">{file ? file.name : 'Click to upload or drag and drop'}</p>
                                <p className="text-sm text-gray-500 mt-2">PDF, JPG, PNG (Max 10MB)</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUploading ? 'Uploading...' : 'Upload Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
