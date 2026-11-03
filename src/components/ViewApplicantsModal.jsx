import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from './ToastContext';

const ViewApplicantsModal = ({ isOpen, onClose, jobId }) => {
    const toast = useToast();
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [offersByApplication, setOffersByApplication] = useState({});
    const [offerDrafts, setOfferDrafts] = useState({});
    const [sendingOfferFor, setSendingOfferFor] = useState(null);
    const [offerError, setOfferError] = useState('');
    const [pipelineError, setPipelineError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [roundDrafts, setRoundDrafts] = useState({});
    const [savingRoundFor, setSavingRoundFor] = useState(null);

    useEffect(() => {
        if (!isOpen || !jobId) return undefined;
        let active = true;
        let requestController;
        let requestInFlight = false;
        const fetchApplicants = async (initial = false) => {
                if (requestInFlight) return;
                requestInFlight = true;
                requestController?.abort();
                requestController = new AbortController();
                if (initial) setLoading(true);
                setError('');
                setOfferError('');
                setPipelineError('');
                try {
                    const response = await axios.get(`/api/v1/application/getJobApplicants/${jobId}`, {
                        withCredentials: true,
                        signal: requestController.signal,
                    });
                    if (!active) return;
                    setApplicants(response.data.data);
                    try {
                        const offersResponse = await axios.get('/api/v1/offer/getCompanyOffers', {
                            withCredentials: true,
                            signal: requestController.signal,
                        });
                        if (!active) return;
                        setOffersByApplication(Object.fromEntries(
                            offersResponse.data.data.map((offer) => [offer.application.toString(), offer])
                        ));
                    } catch (offerFetchError) {
                        if (!active || axios.isCancel(offerFetchError)) return;
                        setOfferError(offerFetchError.response?.data?.message || 'Could not load existing offers.');
                    }
                } catch (err) {
                    if (!active || axios.isCancel(err)) return;
                    setError(err.response?.data?.message || "Failed to load applicants.");
                } finally {
                    requestInFlight = false;
                    if (active && initial) setLoading(false);
                }
        };
        fetchApplicants(true);
        const timer = window.setInterval(() => {
            if (document.visibilityState === 'visible') fetchApplicants();
        }, 30000);
        const refreshIfVisible = () => { if (document.visibilityState === 'visible') fetchApplicants(); };
        window.addEventListener('focus', refreshIfVisible);
        return () => {
            active = false;
            requestController?.abort();
            window.clearInterval(timer);
            window.removeEventListener('focus', refreshIfVisible);
        };
    }, [isOpen, jobId]);

    const visibleApplicants = applicants.filter((app) => {
        const search = searchTerm.trim().toLowerCase();
        const matchesSearch = !search || [app.student?.name, app.student?.rollNo, app.student?.branch, app.student?.batch]
            .some((value) => value?.toLowerCase().includes(search));
        return matchesSearch && (!statusFilter || app.status === statusFilter);
    });

    const updateRoundDraft = (application, field, value) => {
        setRoundDrafts((previous) => ({
            ...previous,
            [application._id]: {
                roundNo: application.rounds?.length ? Math.max(...application.rounds.map((round) => round.roundNo)) + 1 : 1,
                roundType: 'TECHNICAL',
                result: 'PENDING',
                ...previous[application._id],
                [field]: value,
            },
        }));
    };

    const saveInterviewRound = async (application) => {
        const draft = roundDrafts[application._id] || {};
        if (!draft.scheduledAt) {
            setPipelineError('Choose the interview date and time before saving.');
            return;
        }
        setSavingRoundFor(application._id);
        setPipelineError('');
        try {
            const response = await axios.patch(`/api/v1/application/${application._id}/rounds`, {
                ...draft,
                scheduledAt: new Date(draft.scheduledAt).toISOString(),
            }, { withCredentials: true });
            setApplicants((previous) => previous.map((item) => item._id === application._id ? response.data.data : item));
            setRoundDrafts((previous) => ({ ...previous, [application._id]: { ...draft, roundNo: Number(draft.roundNo) + 1, scheduledAt: '' } }));
        } catch (err) {
            setPipelineError(err.response?.data?.message || 'Could not save the interview round.');
        } finally {
            setSavingRoundFor(null);
        }
    };

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
            toast(err.response?.data?.message || "Failed to update status", 'error');
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
                    {!loading && !error && applicants.length > 0 && <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-[1fr_14rem]"><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search name, roll number, branch" aria-label="Search applicants" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white" /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter applicant status" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white"><option value="">All pipeline stages</option><option value="APPLIED">Applied</option><option value="SHORTLISTED">Shortlisted</option><option value="SELECTED">Selected</option><option value="REJECTED">Rejected</option></select></div>}
                    {pipelineError && <p role="alert" className="mb-4 rounded-xl border border-rose-900/30 bg-rose-950/20 p-3 text-sm text-rose-300">{pipelineError}</p>}
                    
                    {!loading && !error && applicants.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-zinc-500 text-lg font-medium">The archive is empty.</p>
                        </div>
                    )}

                    {!loading && applicants.length > 0 && visibleApplicants.length === 0 && <p className="py-8 text-center text-sm text-zinc-500">No applicants match this search or stage.</p>}
                    {!loading && visibleApplicants.length > 0 && (
                        <div className="grid grid-cols-1 gap-6">
                            {visibleApplicants.map(app => (
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
                                            disabled={app.status !== 'APPLIED'}
                                            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-full transition-colors flex-1 md:flex-none disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Shortlist
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus(app._id, 'SELECTED')}
                                            disabled={app.status !== 'SHORTLISTED'}
                                            className="px-6 py-3 bg-white hover:bg-zinc-200 text-black text-sm font-bold rounded-full transition-colors flex-1 md:flex-none shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Hire / Select
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus(app._id, 'REJECTED')}
                                            disabled={['SELECTED', 'REJECTED'].includes(app.status)}
                                            className="px-6 py-3 bg-red-950/50 hover:bg-red-900 text-red-400 text-sm font-medium rounded-full transition-colors border border-red-900/30 flex-1 md:flex-none disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Reject
                                        </button>
                                    </div>

                                    <details className="w-full rounded-xl border border-white/10 bg-black/30 p-4">
                                        <summary className="cursor-pointer text-sm font-semibold text-white">Interview rounds ({app.rounds?.length || 0})</summary>
                                        {app.rounds?.length > 0 && <ol className="my-4 space-y-2">{app.rounds.map((round) => <li key={round._id || round.roundNo} className="rounded-lg bg-zinc-900 p-3 text-xs text-zinc-300">Round {round.roundNo} · {round.roundType} · {round.result}{round.scheduledAt ? ` · ${new Date(round.scheduledAt).toLocaleString()}` : ''}{round.interviewerName ? ` · ${round.interviewerName}` : ''}</li>)}</ol>}
                                        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                                            <input type="number" min="1" aria-label="Round number" value={roundDrafts[app._id]?.roundNo ?? (app.rounds?.length ? Math.max(...app.rounds.map((round) => round.roundNo)) + 1 : 1)} onChange={(event) => updateRoundDraft(app, 'roundNo', event.target.value)} className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white" />
                                            <select aria-label="Round type" value={roundDrafts[app._id]?.roundType || 'TECHNICAL'} onChange={(event) => updateRoundDraft(app, 'roundType', event.target.value)} className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white"><option value="APTITUDE">Aptitude</option><option value="TECHNICAL">Technical</option><option value="HR">HR</option><option value="GD">Group discussion</option></select>
                                            <input type="datetime-local" aria-label="Interview date and time" value={roundDrafts[app._id]?.scheduledAt || ''} onChange={(event) => updateRoundDraft(app, 'scheduledAt', event.target.value)} className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white [color-scheme:dark]" />
                                            <input aria-label="Interviewer name" placeholder="Interviewer name" value={roundDrafts[app._id]?.interviewerName || ''} onChange={(event) => updateRoundDraft(app, 'interviewerName', event.target.value)} className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white" />
                                            <select aria-label="Round result" value={roundDrafts[app._id]?.result || 'PENDING'} onChange={(event) => updateRoundDraft(app, 'result', event.target.value)} className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white"><option value="PENDING">Pending</option><option value="PASS">Pass</option><option value="FAIL">Fail</option></select>
                                            <input aria-label="Interview feedback" placeholder="Feedback (optional)" value={roundDrafts[app._id]?.feedback || ''} onChange={(event) => updateRoundDraft(app, 'feedback', event.target.value)} className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white" />
                                        </div>
                                        <button type="button" onClick={() => saveInterviewRound(app)} disabled={savingRoundFor === app._id || app.status === 'REJECTED'} className="mt-3 rounded-full bg-indigo-300 px-5 py-2 text-sm font-semibold text-black disabled:opacity-50">{savingRoundFor === app._id ? 'Saving…' : 'Save round and notify student'}</button>
                                    </details>

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
