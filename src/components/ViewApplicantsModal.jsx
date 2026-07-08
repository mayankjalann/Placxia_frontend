import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewApplicantsModal = ({ isOpen, onClose, jobId }) => {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && jobId) {
            const fetchApplicants = async () => {
                setLoading(true);
                try {
                    const response = await axios.get(`http://localhost:8000/api/v1/application/getJobApplicants/${jobId}`, {
                        withCredentials: true
                    });
                    setApplicants(response.data.data);
                } catch (err) {
                    setError("Failed to load applicants.");
                } finally {
                    setLoading(false);
                }
            };
            fetchApplicants();
        }
    }, [isOpen, jobId]);

    const handleUpdateStatus = async (applicationId, newStatus) => {
        try {
            await axios.patch(`http://localhost:8000/api/v1/application/updateApplicationStatus/${applicationId}`, 
            { status: newStatus }, 
            { withCredentials: true }
            );
            
            // Instantly update the UI so they don't have to refresh!
            setApplicants(prev => prev.map(app => 
                app._id === applicationId ? { ...app, status: newStatus } : app
            ));
        } catch (err) {
            alert("Failed to update status");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-950 rounded-[2rem] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-950">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Candidates Archive</h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white text-3xl leading-none transition-colors">&times;</button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto flex-1 bg-black/20">
                    {loading && <p className="text-zinc-500 text-lg">Indexing profiles...</p>}
                    {error && <p className="text-red-400 bg-red-950/20 p-4 rounded-xl border border-red-900/30">{error}</p>}
                    
                    {!loading && !error && applicants.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-zinc-500 text-lg font-medium">The archive is empty.</p>
                        </div>
                    )}

                    {!loading && applicants.length > 0 && (
                        <div className="grid grid-cols-1 gap-6">
                            {applicants.map(app => (
                                <div key={app._id} className="bg-zinc-900 rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-white/20 transition-colors">
                                    
                                    {/* Student Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-2">
                                            <h3 className="text-2xl font-bold text-white tracking-tight">
                                                {app.student.name}
                                            </h3>
                                            <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border ${
                                                app.status === 'SHORTLISTED' ? 'border-green-500/50 text-green-400' :
                                                app.status === 'REJECTED' ? 'border-red-500/50 text-red-400' :
                                                'border-zinc-500/50 text-zinc-400'
                                            }`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <div className="text-zinc-400 text-sm flex gap-4 font-medium uppercase tracking-widest">
                                            <p>{app.student.branch} ({app.student.batch})</p>
                                            <p>•</p>
                                            <p>CGPA: {app.student.cgpa}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                                        {app.student.resumeUrl ? (
                                            <a href={app.student.resumeUrl} target="_blank" rel="noreferrer" className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-full transition-colors flex-1 md:flex-none text-center">
                                                Resume
                                            </a>
                                        ) : (
                                            <button disabled className="px-6 py-3 bg-zinc-900 text-zinc-600 text-sm font-medium rounded-full cursor-not-allowed border border-white/5 flex-1 md:flex-none">
                                                No Resume
                                            </button>
                                        )}
                                        
                                        <button 
                                            onClick={() => handleUpdateStatus(app._id, 'SHORTLISTED')}
                                            className="px-6 py-3 bg-white hover:bg-zinc-200 text-black text-sm font-medium rounded-full transition-colors flex-1 md:flex-none"
                                        >
                                            Shortlist
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus(app._id, 'REJECTED')}
                                            className="px-6 py-3 bg-red-950 hover:bg-red-900 text-red-400 text-sm font-medium rounded-full transition-colors border border-red-900/50 flex-1 md:flex-none"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewApplicantsModal;