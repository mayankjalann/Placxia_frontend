import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import JobDetailsModal from '../components/JobDetailsModal';

const StudentDash = () => {
    const userData = useSelector((state) => state.auth.userData);
    const studentProfile = userData?.studentProfile || {};
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [appliedJobs, setAppliedJobs] = useState(new Set());
    const [selectedJobId, setSelectedJobId] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [jobsRes, appsRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/v1/job/getAllOpenJobs', { withCredentials: true }),
                    axios.get('http://localhost:8000/api/v1/application/getMyApplications', { withCredentials: true })
                ]);
                
                setJobs(jobsRes.data.data);
                
                const appliedIds = new Set(appsRes.data.data.map(app => app.job));
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
            await axios.post(`http://localhost:8000/api/v1/application/applyForJob/${jobId}`, {}, { withCredentials: true });
            setAppliedJobs(prev => new Set(prev).add(jobId)); 
            alert("Application registered.");
        } catch (err) {
            if (err.response?.data?.message === "You have already applied for this job") {
                setAppliedJobs(prev => new Set(prev).add(jobId));
            } else {
                alert(err.response?.data?.message || "Failed to apply");
            }
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

                {loading && <p className="text-zinc-500 animate-pulse text-lg">Indexing network...</p>}
                {error && <p className="text-red-400 p-4 bg-red-950/20 border border-red-900/30 rounded-xl">{error}</p>}

                {!loading && !error && (
                    <>
                        {jobs.length === 0 ? (
                            <div className="w-full bg-zinc-950 border border-white/5 rounded-[2rem] p-16 md:p-32 flex flex-col items-center justify-center text-center">
                                <h3 className="text-3xl font-bold tracking-tight mb-4 text-white/80">No Opportunities Found</h3>
                                <p className="text-zinc-500 text-lg max-w-[30ch]">The network is currently empty. Please return later for new archives.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {jobs.map((job, index) => (
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
                                                <span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest rounded-full border border-zinc-700 text-zinc-400">
                                                    {job.jobType}
                                                </span>
                                            </div>

                                            <div className="mt-auto relative z-10 transition-transform duration-500 group-hover:-translate-y-16">
                                                <h3 className="text-2xl font-bold tracking-tight text-white/90 mb-2">{job.title}</h3>
                                                <div className="text-zinc-500 text-sm mb-4 font-semibold tracking-wider uppercase">{job.company?.companyProfile?.companyName || 'Undisclosed'}</div>
                                                
                                                <div className="flex gap-4 text-sm text-zinc-400 border-t border-white/5 pt-4">
                                                    <span>{job.location}</span>
                                                    <span>•</span>
                                                    <span>{job.salary} LPA</span>
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