import React, { useState, useEffect } from 'react';
import axios from 'axios';

const JobDetailsModal = ({ jobId, onClose, hasApplied, onApply }) => {
    const [jobDetails, setJobDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/v1/job/getJobById/${jobId}`, {
                    withCredentials: true
                });
                setJobDetails(response.data.data);
            } catch (err) {
                alert("Failed to load job details");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [jobId]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full transition-colors"
                >
                    ✕
                </button>

                {loading ? (
                    <div className="p-10 text-center text-indigo-400 animate-pulse">Loading deep details...</div>
                ) : jobDetails ? (
                    <div className="p-8">
                        {/* Header: Company & Job */}
                        <div className="border-b border-slate-700 pb-6 mb-6">
                            <h2 className="text-3xl font-black text-white mb-2">{jobDetails.title}</h2>
                            <div className="flex items-center gap-3">
                                {jobDetails.company?.logoUrl && (
                                    <img src={jobDetails.company.logoUrl} alt="logo" className="w-8 h-8 rounded" />
                                )}
                                <p className="text-xl text-indigo-400 font-bold">{jobDetails.company?.name}</p>
                            </div>
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            
                            {/* Left Column: Job Specs */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-300 border-b border-slate-700 pb-2">Job Specifications</h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-800 p-3 rounded-lg">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Package (CTC)</p>
                                        <p className="text-white font-bold">{jobDetails.ctcMin} - {jobDetails.ctcMax} LPA</p>
                                    </div>
                                    <div className="bg-slate-800 p-3 rounded-lg">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Type</p>
                                        <p className="text-white font-bold">{jobDetails.jobType}</p>
                                    </div>
                                    <div className="bg-slate-800 p-3 rounded-lg">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Location</p>
                                        <p className="text-white font-bold">{jobDetails.location || "Not specified"}</p>
                                    </div>
                                    <div className="bg-slate-800 p-3 rounded-lg">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Openings</p>
                                        <p className="text-white font-bold">{jobDetails.positionsAvailable}</p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Required Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {jobDetails.requiredSkills?.map(skill => (
                                            <span key={skill} className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-sm font-semibold rounded-full border border-indigo-500/30">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Requirements & Company Info */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-300 border-b border-slate-700 pb-2 mb-3">Academic Criteria</h3>
                                    <ul className="text-sm text-slate-300 space-y-2">
                                        <li>• Minimum CGPA: <span className="font-bold text-white">{jobDetails.cgpaCutoff}</span></li>
                                        <li>• 12th Grade: <span className="font-bold text-white">{jobDetails.twelfthCutoff}%</span></li>
                                        <li>• 10th Grade: <span className="font-bold text-white">{jobDetails.tenthCutoff}%</span></li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-slate-300 border-b border-slate-700 pb-2 mb-3">About {jobDetails.company?.name}</h3>
                                    <p className="text-sm text-slate-400">{jobDetails.company?.description}</p>
                                    {jobDetails.company?.website && (
                                        <a href={jobDetails.company.website} target="_blank" rel="noreferrer" className="text-indigo-400 text-sm hover:underline mt-2 inline-block">
                                            Visit Website →
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Full Description */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-slate-300 border-b border-slate-700 pb-2 mb-3">Job Description</h3>
                            <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                                {jobDetails.description}
                            </p>
                        </div>

                        {/* Big Apply Button */}
                        <div className="flex justify-end gap-4 border-t border-slate-700 pt-6">
                            <button onClick={onClose} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors">
                                Close
                            </button>
                            <button 
                                onClick={() => {
                                    onApply(jobId);
                                    onClose(); // Optional: close modal after applying
                                }}
                                disabled={hasApplied}
                                className={`px-8 py-3 font-bold rounded-lg transition-all shadow-lg ${
                                    hasApplied 
                                    ? "bg-green-600/20 text-green-500 cursor-not-allowed border border-green-600/50" 
                                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30"
                                }`}
                            >
                                {hasApplied ? "Applied ✓" : "Apply Now"}
                            </button>
                        </div>

                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default JobDetailsModal;
