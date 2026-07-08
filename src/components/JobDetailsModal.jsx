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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-950 border border-white/10 rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors text-3xl leading-none z-10"
                >
                    &times;
                </button>

                {loading ? (
                    <div className="p-20 text-center text-zinc-500 text-lg">Indexing archive...</div>
                ) : jobDetails ? (
                    <div className="p-8 md:p-12">
                        {/* Header: Company & Job */}
                        <div className="border-b border-white/5 pb-8 mb-8">
                            <div className="flex items-center gap-4 mb-4">
                                {jobDetails.company?.logoUrl && (
                                    <div className="w-12 h-12 bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center border border-white/5">
                                        <img src={jobDetails.company.logoUrl} alt="logo" className="w-full h-full object-contain p-1" />
                                    </div>
                                )}
                                <p className="text-xl text-zinc-400 font-serif italic">{jobDetails.company?.name || 'Undisclosed'}</p>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{jobDetails.title}</h2>
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                            
                            {/* Left Column: Job Specs */}
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-sm font-semibold tracking-widest uppercase text-zinc-500 mb-4">Specifications</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-zinc-900 p-4 rounded-2xl border border-white/5">
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Package</p>
                                            <p className="text-white font-medium">{jobDetails.ctcMin} - {jobDetails.ctcMax} LPA</p>
                                        </div>
                                        <div className="bg-zinc-900 p-4 rounded-2xl border border-white/5">
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Type</p>
                                            <p className="text-white font-medium">{jobDetails.jobType}</p>
                                        </div>
                                        <div className="bg-zinc-900 p-4 rounded-2xl border border-white/5">
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Location</p>
                                            <p className="text-white font-medium">{jobDetails.location || "Not specified"}</p>
                                        </div>
                                        <div className="bg-zinc-900 p-4 rounded-2xl border border-white/5">
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Openings</p>
                                            <p className="text-white font-medium">{jobDetails.positionsAvailable}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold tracking-widest uppercase text-zinc-500 mb-4">Required Knowledge</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {jobDetails.requiredSkills?.map(skill => (
                                            <span key={skill} className="px-4 py-2 bg-zinc-900 text-zinc-300 text-sm font-medium rounded-full border border-white/5">
                                                {skill}
                                            </span>
                                        ))}
                                        {(!jobDetails.requiredSkills || jobDetails.requiredSkills.length === 0) && (
                                            <span className="text-zinc-600 text-sm italic">No specific skills listed.</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Requirements & Company Info */}
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-sm font-semibold tracking-widest uppercase text-zinc-500 mb-4">Academic Criteria</h3>
                                    <ul className="text-zinc-300 space-y-3 font-medium">
                                        <li className="flex justify-between border-b border-white/5 pb-2">
                                            <span className="text-zinc-500">CGPA Minimum</span> 
                                            <span className="text-white">{jobDetails.cgpaCutoff}</span>
                                        </li>
                                        <li className="flex justify-between border-b border-white/5 pb-2">
                                            <span className="text-zinc-500">12th Grade</span> 
                                            <span className="text-white">{jobDetails.twelfthCutoff}%</span>
                                        </li>
                                        <li className="flex justify-between border-b border-white/5 pb-2">
                                            <span className="text-zinc-500">10th Grade</span> 
                                            <span className="text-white">{jobDetails.tenthCutoff}%</span>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold tracking-widest uppercase text-zinc-500 mb-4">About {jobDetails.company?.name}</h3>
                                    <p className="text-zinc-400 leading-relaxed text-sm">{jobDetails.company?.description || "No company description available."}</p>
                                    {jobDetails.company?.website && (
                                        <a href={jobDetails.company.website} target="_blank" rel="noreferrer" className="text-white text-sm hover:text-zinc-300 mt-4 inline-block font-medium border-b border-white/20 pb-1">
                                            Visit Website
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Full Description */}
                        <div className="mb-12">
                            <h3 className="text-sm font-semibold tracking-widest uppercase text-zinc-500 mb-4">Complete Description</h3>
                            <div className="bg-zinc-900 rounded-2xl p-6 md:p-8 border border-white/5">
                                <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed text-sm">
                                    {jobDetails.description}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-4 border-t border-white/5 pt-8">
                            <button onClick={onClose} className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-full transition-colors flex-1 md:flex-none">
                                Close
                            </button>
                            <button 
                                onClick={() => {
                                    onApply(jobId);
                                    onClose();
                                }}
                                disabled={hasApplied}
                                className={`px-12 py-4 font-medium rounded-full transition-colors flex-[2] md:flex-none ${
                                    hasApplied 
                                    ? "bg-zinc-800/50 text-zinc-500 cursor-not-allowed border border-white/5" 
                                    : "bg-white hover:bg-zinc-200 text-black"
                                }`}
                            >
                                {hasApplied ? "Application Submitted" : "Submit Application"}
                            </button>
                        </div>

                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default JobDetailsModal;
