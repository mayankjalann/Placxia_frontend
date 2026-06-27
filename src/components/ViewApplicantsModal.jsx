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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                    <h2 className="text-2xl font-bold text-white">Review Applicants</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {loading && <p className="text-indigo-400 animate-pulse text-lg">Loading applicants...</p>}
                    {error && <p className="text-red-500 bg-red-500/10 p-4 rounded-lg">{error}</p>}
                    
                    {!loading && !error && applicants.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-slate-400 text-lg">No students have applied to this job yet.</p>
                        </div>
                    )}

                    {!loading && applicants.length > 0 && (
                        <div className="space-y-4">
                            {applicants.map(app => (
                                <div key={app._id} className="bg-slate-800 rounded-xl p-5 border border-slate-700 flex justify-between items-center hover:border-indigo-500/50 transition-colors">
                                    
                                    {/* Student Info */}
                                    <div>
                                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                            {app.student.name}
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                                                app.status === 'SHORTLISTED' ? 'bg-green-500/20 text-green-400' :
                                                app.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                                'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                                {app.status}
                                            </span>
                                        </h3>
                                        <div className="text-slate-400 text-sm mt-2 flex gap-4">
                                            <p>🎓 {app.student.branch} ({app.student.batch})</p>
                                            <p>⭐ CGPA: {app.student.cgpa}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        {app.student.resumeUrl ? (
                                            <a href={app.student.resumeUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors flex items-center">
                                                View Resume
                                            </a>
                                        ) : (
                                            <button disabled className="px-4 py-2 bg-slate-700/50 text-slate-500 font-semibold rounded-lg cursor-not-allowed">
                                                No Resume
                                            </button>
                                        )}
                                        
                                        <button 
                                            onClick={() => handleUpdateStatus(app._id, 'SHORTLISTED')}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                                        >
                                            Shortlist
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus(app._id, 'REJECTED')}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
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