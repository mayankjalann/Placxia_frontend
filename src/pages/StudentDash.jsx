import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import JobDetailsModal from '../components/JobDetailsModal';
import { login } from '../store/authSlice';
import { useToast } from '../components/ToastContext';

const StudentDash = () => {
    const userData = useSelector((state) => state.auth.userData);
    const dispatch = useDispatch();
    const studentProfile = userData?.studentProfile || {};
    const navigate = useNavigate();
    const toast = useToast();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [appliedJobs, setAppliedJobs] = useState(new Set());
    const [myApplications, setMyApplications] = useState([]);
    const [offers, setOffers] = useState([]);
    const [savedJobIds, setSavedJobIds] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [jobTypeFilter, setJobTypeFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [minimumSalary, setMinimumSalary] = useState('');
    const [savedOnly, setSavedOnly] = useState(false);
    const [actionMessage, setActionMessage] = useState('');
    const [respondingToOffer, setRespondingToOffer] = useState(null);
    const [selectedJobId, setSelectedJobId] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [jobsRes, appsRes, offersRes, savedRes] = await Promise.all([
                    axios.get('/api/v1/job/getAllOpenJobs', { withCredentials: true }),
                    axios.get('/api/v1/application/getMyApplications', { withCredentials: true }),
                    axios.get('/api/v1/offer/getStudentOffers', { withCredentials: true }),
                    axios.get('/api/v1/job/saved', { withCredentials: true })
                ]);
                
                setJobs(jobsRes.data.data);
                
                const myApps = appsRes.data.data;
                setMyApplications(myApps);
                setOffers(offersRes.data.data);
                setSavedJobIds(new Set(savedRes.data.data.map((job) => job._id)));

                // app.job is now populated, so we must extract app.job._id
                const appliedIds = new Set(myApps.map(app => app.job?._id || app.job));
                setAppliedJobs(appliedIds);
                
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load jobs");
                setLoading(false);
            }
        }

        if (userData) {
            fetchDashboardData();
        } else {
            navigate('/login');
        }
    }, [userData, navigate])

    const filteredJobs = jobs.filter((job) => {
        const query = searchTerm.trim().toLowerCase();
        const matchesSearch = !query || [job.title, job.description, job.company?.name, job.location, ...(job.requiredSkills || [])]
            .some((value) => value?.toLowerCase().includes(query));
        return matchesSearch && (!jobTypeFilter || job.jobType === jobTypeFilter) &&
            (!locationFilter || job.location?.toLowerCase().includes(locationFilter.toLowerCase())) &&
            (!minimumSalary || job.ctcMax >= Number(minimumSalary)) &&
            (!savedOnly || savedJobIds.has(job._id));
    });

    const toggleSaveJob = async (jobId) => {
        setActionMessage('');
        try {
            const response = await axios.patch(`/api/v1/job/save/${jobId}`, {}, { withCredentials: true });
            setSavedJobIds((current) => {
                const next = new Set(current);
                if (response.data.data.saved) next.add(jobId);
                else next.delete(jobId);
                return next;
            });
        } catch (requestError) {
            setActionMessage(requestError.response?.data?.message || 'Could not save this job.');
        }
    };

    // Calculate Dynamic Profile Strength
    const calculateProfileStrength = () => {
        let score = 0;
        let total = 6;
        if (studentProfile.name) score++;
        if (studentProfile.branch) score++;
        if (studentProfile.cgpa && studentProfile.cgpa > 0) score++;
        if (studentProfile.skills && studentProfile.skills.length > 0) score++;
        if (studentProfile.resumeUrl) score++;
        if (studentProfile.linkedinUrl || studentProfile.githubUrl) score++;
        return Math.round((score / total) * 100);
    };
    
    const profileStrength = calculateProfileStrength();
    
    // Format placement status
    const formatStatus = (status) => {
        if (status === "MULTIPLE_OFFERS") return "Multiple Offers";
        if (status === "PLACED") return "Placed";
        return "Unplaced";
    };

    const handleApply = async (jobId) => {
        try {
            await axios.post(`/api/v1/application/applyForJob/${jobId}`, {}, { withCredentials: true });
            setAppliedJobs(prev => new Set(prev).add(jobId)); 
            try {
                const applicationsResponse = await axios.get('/api/v1/application/getMyApplications', { withCredentials: true });
                setMyApplications(applicationsResponse.data.data);
            } catch {
                // The application succeeded; a refresh failure must not show a false apply error.
            }
            toast("Application registered.");
        } catch (err) {
            if (err.response?.status === 409 || err.response?.data?.message === "You have already applied for this job") {
                setAppliedJobs(prev => new Set(prev).add(jobId));
            } else {
                toast(err.response?.data?.message || "Failed to apply", 'error');
            }
        }
    };

    const handleOfferResponse = async (offerId, status) => {
        setRespondingToOffer(offerId);
        try {
            const response = await axios.patch(
                `/api/v1/offer/respondToOffer/${offerId}`,
                { status },
                { withCredentials: true }
            );
            setOffers((previous) => previous.map((offer) =>
                offer._id === offerId ? response.data.data : offer
            ));
            if (status === 'ACCEPTED') {
                const placementStatus = studentProfile.placementStatus === 'PLACED' ||
                    studentProfile.placementStatus === 'MULTIPLE_OFFERS'
                    ? 'MULTIPLE_OFFERS'
                    : 'PLACED';
                dispatch(login({
                    userData: {
                        ...userData,
                        studentProfile: { ...studentProfile, placementStatus }
                    }
                }));
            }
        } catch (err) {
            toast(err.response?.data?.message || 'Could not update this offer. Please try again.', 'error');
        } finally {
            setRespondingToOffer(null);
        }
    };

    return (
        <div className="bg-black text-white min-h-screen font-sans pb-32">
            
            <header className="pt-24 pb-16 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 text-zinc-500">
                        Candidate Profile
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-2">
                        Welcome, <br className="md:hidden" />
                        <span className="font-serif italic font-normal text-white/80">{userData?.name}</span>
                    </h1>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="mt-8 md:mt-0 text-right"
                >
                    <div className="text-sm font-semibold tracking-widest uppercase text-zinc-500 mb-1">Status</div>
                    <div className="text-2xl font-serif italic text-white/90">{formatStatus(studentProfile?.placementStatus)}</div>
                </motion.div>
            </header>

            <main className="max-w-7xl mx-auto px-6 lg:px-12 mt-16">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold tracking-widest uppercase text-zinc-500 mb-2">Applications Sent</span>
                        <span className="text-5xl font-serif italic text-white/90">{appliedJobs.size}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold tracking-widest uppercase text-zinc-500 mb-2">Open Positions</span>
                        <span className="text-5xl font-serif italic text-white/90">{jobs.length}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold tracking-widest uppercase text-zinc-500 mb-2">Profile Integrity</span>
                        <span className="text-5xl font-serif italic text-white/90">{profileStrength}%</span>
                    </div>
                </div>

                <div className="flex justify-between items-end mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">The Network.</h2>
                </div>

                {/* --- MY APPLICATIONS TRACKER --- */}
                {myApplications.length > 0 && (
                    <div className="mb-16">
                        <h3 className="text-xl font-bold tracking-tight mb-6 text-white/80 border-b border-white/10 pb-4">My Applications</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myApplications.map((app) => (
                                <div key={app._id} className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex justify-between items-center hover:border-white/20 transition-colors">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">{app.job?.title}</h3>
                                        <p className="text-sm text-zinc-400 font-medium uppercase tracking-widest">{app.job?.company?.name || 'Unknown Company'}</p>
                                    </div>
                                    <span className={`text-[10px] px-4 py-2 rounded-full font-bold uppercase tracking-widest border ${
                                        app.status === 'SELECTED' ? 'border-green-500/50 text-green-400 bg-green-950/30' :
                                        app.status === 'SHORTLISTED' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-950/30' :
                                        app.status === 'REJECTED' ? 'border-red-500/50 text-red-400 bg-red-950/30' :
                                        'border-zinc-500/50 text-zinc-400 bg-zinc-900' 
                                    }`}>
                                        {app.status}
                                    </span>
                                    {app.rounds?.length > 0 && (
                                        <ol className="mt-4 w-full space-y-2 border-l border-white/10 pl-4">
                                            {app.rounds.map((round) => (
                                                <li key={round._id || round.roundNo} className="text-xs text-zinc-400">
                                                    <span className="font-semibold text-zinc-200">Round {round.roundNo} · {round.roundType}</span>
                                                    {round.scheduledAt && <span> · {new Date(round.scheduledAt).toLocaleString()}</span>}
                                                    <span> · {round.result}</span>
                                                    {round.feedback && <p className="mt-1">{round.feedback}</p>}
                                                </li>
                                            ))}
                                        </ol>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {offers.length > 0 && (
                    <section className="mb-16">
                        <h3 className="text-xl font-bold tracking-tight mb-6 text-white/80 border-b border-white/10 pb-4">Offers</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {offers.map((offer) => (
                                <article key={offer._id} className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-white">{offer.job?.title || 'Job offer'}</h4>
                                            <p className="mt-1 text-sm text-zinc-400">{offer.company?.name || 'Company'}</p>
                                            <p className="mt-3 text-sm text-zinc-300">{offer.offeredCtc} LPA</p>
                                            {offer.joiningDate && (
                                                <p className="mt-1 text-xs text-zinc-500">Joining {new Date(offer.joiningDate).toLocaleDateString()}</p>
                                            )}
                                        </div>
                                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase text-zinc-300">{offer.status}</span>
                                    </div>
                                    {offer.status === 'PENDING' && (
                                        <div className="mt-5 flex gap-3">
                                            <button
                                                type="button"
                                                disabled={respondingToOffer === offer._id}
                                                onClick={() => handleOfferResponse(offer._id, 'ACCEPTED')}
                                                className="flex-1 rounded-full bg-white px-4 py-3 text-sm font-semibold text-black disabled:opacity-50"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                type="button"
                                                disabled={respondingToOffer === offer._id}
                                                onClick={() => handleOfferResponse(offer._id, 'DECLINED')}
                                                className="flex-1 rounded-full bg-zinc-800 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    </section>
                )}
                {/* ------------------------------- */}

                {loading && <p className="text-zinc-500 animate-pulse text-lg">Indexing network...</p>}
                {error && <p className="text-red-400 p-4 bg-red-950/20 border border-red-900/30 rounded-xl">{error}</p>}
                <div className="mb-8 grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-zinc-950 p-4 md:grid-cols-4">
                    <input aria-label="Search jobs" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search role, company, skill" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500" />
                    <select aria-label="Filter by job type" value={jobTypeFilter} onChange={(event) => setJobTypeFilter(event.target.value)} className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white">
                        <option value="">All job types</option><option value="FULL_TIME">Full time</option><option value="INTERN">Internship</option><option value="PPO">PPO</option>
                    </select>
                    <input aria-label="Filter by location" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} placeholder="Location" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500" />
                    <input aria-label="Minimum package" type="number" min="0" value={minimumSalary} onChange={(event) => setMinimumSalary(event.target.value)} placeholder="Minimum package (LPA)" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500" />
                </div>
                <button type="button" aria-pressed={savedOnly} onClick={() => setSavedOnly((value) => !value)} className={`mb-6 rounded-full border px-5 py-2.5 text-sm ${savedOnly ? 'border-amber-300 bg-amber-300 text-black' : 'border-white/15 text-white hover:bg-white/5'}`}>
                    {savedOnly ? 'Showing saved jobs · Clear' : `Saved jobs (${savedJobIds.size})`}
                </button>
                {actionMessage && <p role="status" className="mb-5 text-sm text-rose-300">{actionMessage}</p>}

                {!loading && !error && (
                    <>
                        {filteredJobs.length === 0 ? (
                            <div className="w-full bg-zinc-950 border border-white/5 rounded-[2rem] p-16 md:p-32 flex flex-col items-center justify-center text-center">
                                <h3 className="text-3xl font-bold tracking-tight mb-4 text-white/80">No matching opportunities</h3>
                                <p className="text-zinc-500 text-lg max-w-[30ch]">Try clearing one or more filters to see available roles.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredJobs.map((job, index) => (
                                    <motion.div 
                                        key={job._id}
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, delay: index * 0.1 }}
                                        className="group relative flex flex-col h-full"
                                    >
                                        <div className="w-full bg-zinc-950 rounded-[2rem] overflow-hidden min-h-[320px] border border-white/5 hover:border-white/20 transition-colors duration-500 relative flex flex-col p-8">
                                            
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="text-5xl font-serif italic text-white/10">{(index + 1).toString().padStart(2, '0')}</div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest rounded-full border border-zinc-700 text-zinc-400">{job.jobType}</span>
                                                    <button type="button" onClick={() => toggleSaveJob(job._id)} aria-label={savedJobIds.has(job._id) ? 'Remove saved job' : 'Save job'} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white hover:bg-white/10">{savedJobIds.has(job._id) ? '★ Saved' : '☆ Save'}</button>
                                                </div>
                                            </div>

                                            <div className="mt-auto relative z-10 transition-transform duration-500 group-hover:-translate-y-16">
                                                <h3 className="text-2xl font-bold tracking-tight text-white/90 mb-2">{job.title}</h3>
                                                <div className="text-zinc-500 text-sm mb-4 font-semibold tracking-wider uppercase">{job.company?.name || 'Undisclosed'}</div>
                                                
                                                <div className="flex gap-4 text-sm text-zinc-400 border-t border-white/5 pt-4">
                                                    <span>{job.location}</span>
                                                    <span>•</span>
                                                    <span>{job.ctcMin}–{job.ctcMax} LPA</span>
                                                </div>
                                            </div>

                                            <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex gap-2 justify-center bg-gradient-to-t from-black via-zinc-950/90 to-transparent pt-12">
                                                <button 
                                                    onClick={() => setSelectedJobId(job._id)}
                                                    className="px-6 py-3 bg-zinc-800 text-white text-sm font-semibold rounded-full hover:bg-zinc-700 transition-colors flex-1"
                                                >
                                                    Details
                                                </button>
                                                <button 
                                                    onClick={() => handleApply(job._id)}
                                                    disabled={appliedJobs.has(job._id)}
                                                    className={`px-6 py-3 text-sm font-semibold rounded-full transition-colors flex-[2] ${
                                                        appliedJobs.has(job._id) 
                                                        ? "bg-zinc-800/50 text-zinc-500 cursor-not-allowed border border-white/5" 
                                                        : "bg-white text-black hover:bg-zinc-200"
                                                    }`}
                                                >
                                                    {appliedJobs.has(job._id) ? "Applied" : "Apply Now"}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {selectedJobId && (
                <JobDetailsModal 
                    jobId={selectedJobId} 
                    onClose={() => setSelectedJobId(null)}
                    hasApplied={appliedJobs.has(selectedJobId)}
                    onApply={handleApply}
                />
            )}
        </div>
    );
};

export default StudentDash;
