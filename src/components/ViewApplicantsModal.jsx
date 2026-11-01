import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewApplicantsModal = ({ isOpen, onClose, jobId }) => {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [offersByApplication, setOffersByApplication] = useState({});
    const [offerDrafts, setOfferDrafts] = useState({});
    const [sendingOfferFor, setSendingOfferFor] = useState(null);
    const [offerError, setOfferError] = useState('');

    useEffect(() => {
        if (isOpen && jobId) {
            const fetchApplicants = async () => {
                setLoading(true);
                setError('');
                setOfferError('');
                try {
                    const response = await axios.get(`/api/v1/application/getJobApplicants/${jobId}`, {
                        withCredentials: true
                    });
                    setApplicants(response.data.data);
                    try {
                        const offersResponse = await axios.get('/api/v1/offer/getCompanyOffers', {
                            withCredentials: true
                        });
                        setOffersByApplication(Object.fromEntries(
                            offersResponse.data.data.map((offer) => [offer.application.toString(), offer])
                        ));
                    } catch (offerFetchError) {
                        setOfferError(offerFetchError.response?.data?.message || 'Could not load existing offers.');
                    }
                } catch (err) {
                    setError(err.response?.data?.message || "Failed to load applicants.");
                } finally {
                    setLoading(false);
                }
            };
            fetchApplicants();
        }
    }, [isOpen, jobId]);

    const handleUpdateStatus = async (applicationId, newStatus) => {
        try {
            await axios.patch(`/api/v1/application/updateApplicationStatus/${applicationId}`,
            { status: newStatus }, 
            { withCredentials: true }
            );
            
            // Instantly update the UI so they don't have to refresh!
            setApplicants(prev => prev.map(app => 
                app._id === applicationId ? { ...app, status: newStatus } : app
            ));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update status");
        }
    };

    const handleOfferDraftChange = (applicationId, field, value) => {
        setOfferDrafts((previous) => ({
            ...previous,
            [applicationId]: { ...previous[applicationId], [field]: value }
        }));
    };

    const handleCreateOffer = async (applicationId) => {
        const draft = offerDrafts[applicationId] || {};
        if (!draft.offeredCtc || Number(draft.offeredCtc) <= 0) {
            setOfferError('Enter an offered package greater than zero.');
            return;
        }

        setSendingOfferFor(applicationId);
        setOfferError('');
        try {
            const response = await axios.post(
                `/api/v1/offer/createOffer/${applicationId}`,
                { offeredCtc: Number(draft.offeredCtc), joiningDate: draft.joiningDate || undefined },
                { withCredentials: true }
            );
            setOffersByApplication((previous) => ({
                ...previous,
                [applicationId]: response.data.data
            }));
        } catch (err) {
            setOfferError(err.response?.data?.message || 'Failed to send the offer.');
        } finally {
            setSendingOfferFor(null);
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
                                                {app.student?.name || 'Student profile unavailable'}
                                            </h3>
                                            <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border ${
                                                app.status === 'SELECTED' ? 'border-green-500/50 text-green-400 bg-green-950/30' :
                                                app.status === 'SHORTLISTED' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-950/30' :
                                                app.status === 'REJECTED' ? 'border-red-500/50 text-red-400 bg-red-950/30' :
                                                'border-zinc-500/50 text-zinc-400'
                                            }`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <div className="text-zinc-400 text-sm flex gap-4 font-medium uppercase tracking-widest">
                                            <p>{app.student?.branch} ({app.student?.batch})</p>
                                            <p>•</p>
                                            <p>CGPA: {app.student?.cgpa ?? '—'}</p>
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
                                            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-full transition-colors flex-1 md:flex-none"
                                        >
                                            Shortlist
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus(app._id, 'SELECTED')}
                                            className="px-6 py-3 bg-white hover:bg-zinc-200 text-black text-sm font-bold rounded-full transition-colors flex-1 md:flex-none shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                        >
                                            Hire / Select
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus(app._id, 'REJECTED')}
                                            className="px-6 py-3 bg-red-950/50 hover:bg-red-900 text-red-400 text-sm font-medium rounded-full transition-colors border border-red-900/30 flex-1 md:flex-none"
                                        >
                                            Reject
                                        </button>
                                    </div>

                                    {app.status === 'SELECTED' && (
                                        <div className="w-full md:w-72 space-y-3">
                                            {offersByApplication[app._id] ? (
                                                <p className="text-sm text-emerald-400">
                                                    Offer {offersByApplication[app._id].status.toLowerCase()} · {offersByApplication[app._id].offeredCtc} LPA
                                                </p>
                                            ) : (
                                                <>
                                                    <input
                                                        type="number"
                                                        min="0.01"
                                                        step="0.01"
                                                        value={offerDrafts[app._id]?.offeredCtc || ''}
                                                        onChange={(e) => handleOfferDraftChange(app._id, 'offeredCtc', e.target.value)}
                                                        placeholder="Offer package (LPA)"
                                                        aria-label="Offer package in LPA"
                                                        className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white"
                                                    />
                                                    <input
                                                        type="date"
                                                        value={offerDrafts[app._id]?.joiningDate || ''}
                                                        onChange={(e) => handleOfferDraftChange(app._id, 'joiningDate', e.target.value)}
                                                        aria-label="Joining date"
                                                        className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white [color-scheme:dark]"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCreateOffer(app._id)}
                                                        disabled={sendingOfferFor === app._id}
                                                        className="w-full rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-black disabled:opacity-50"
                                                    >
                                                        {sendingOfferFor === app._id ? 'Sending offer…' : 'Send offer'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {offerError && <p className="mt-4 text-sm text-red-400">{offerError}</p>}
                </div>
            </div>
        </div>
    );
};

export default ViewApplicantsModal;
