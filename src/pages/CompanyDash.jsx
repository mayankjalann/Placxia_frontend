import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { motion } from 'motion/react';
import PostJobModal from '../components/PostJobModal';
import ViewApplicantsModal from '../components/ViewApplicantsModal';

const CompanyDash = () => {
    const userData = useSelector((state) => state.auth.userData);
    
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [jobToEdit, setJobToEdit] = useState(null);
    const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);

    const fetchCompanyJobs = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/v1/job/getCompanyJobs', {
                withCredentials: true 
            });
            setJobs(response.data.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load jobs");
            setLoading(false);
        }
    };

    const handlePublish = async (jobId) => {
        try {
            await axios.patch(`http://localhost:8000/api/v1/job/publish/${jobId}`, {}, { withCredentials: true });
            fetchCompanyJobs();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to publish job");
        }
    };

    const handleViewApplicants = (jobId) => {
        setSelectedJobId(jobId);
        setIsApplicantsModalOpen(true);
    };

    useEffect(() => {
        fetchCompanyJobs();
    }, []);

    const activePostings = jobs.filter(j => j.status === 'OPEN').length;

    return (
        <div className="bg-black text-white min-h-screen font-sans pb-32">
            
            {/* Header Section */}
            <header className="pt-24 pb-16 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 text-zinc-500">
                        Corporate Dashboard
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-2">
                        Welcome, <br className="md:hidden" />
                        <span className="font-serif italic font-normal text-white/80">{userData?.name || 'TechNova'}</span>
                    </h1>
                </motion.div>

                <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    onClick={() => {
                        setJobToEdit(null);
                        setIsModalOpen(true);
                    }}
                    className="mt-8 md:mt-0 relative inline-flex items-center justify-center font-medium overflow-hidden rounded-full transition-colors focus:outline-none py-3 tracking-tight h-14 px-8 text-base bg-white text-black hover:bg-zinc-200"
                >
                    Post New Listing
                </motion.button>
            </header>

            <main className="max-w-7xl mx-auto px-6 lg:px-12 mt-16">
                
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold tracking-widest uppercase text-zinc-500 mb-2">Total Archives</span>
                        <span className="text-5xl font-serif italic text-white/90">{jobs.length}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold tracking-widest uppercase text-zinc-500 mb-2">Active Roles</span>
                        <span className="text-5xl font-serif italic text-white/90">{activePostings}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold tracking-widest uppercase text-zinc-500 mb-2">Global Network</span>
                        <span className="text-5xl font-serif italic text-white/90">24/7</span>
                    </div>
                </div>

                <div className="flex justify-between items-end mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">The Archives.</h2>
                </div>

                {loading && <p className="text-zinc-500 animate-pulse text-lg">Retrieving architecture...</p>}
                {error && <p className="text-red-400 p-4 bg-red-950/20 border border-red-900/30 rounded-xl">{error}</p>}

                {!loading && !error && (
                    <>
                        {jobs.length === 0 ? (
                            <div className="w-full bg-zinc-950 border border-white/5 rounded-[2rem] p-16 md:p-32 flex flex-col items-center justify-center text-center">
                                <h3 className="text-3xl font-bold tracking-tight mb-4 text-white/80">No Roles Discovered</h3>
                                <p className="text-zinc-500 text-lg max-w-[30ch]">Your archive is currently empty. Initiate a new listing to begin sourcing talent.</p>
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
                                            
                                            {/* Top Status */}
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="text-5xl font-serif italic text-white/10">{(index + 1).toString().padStart(2, '0')}</div>
                                                <span className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-widest rounded-full border ${
                                                    job.status === 'OPEN' ? 'border-zinc-500 text-zinc-300' : 
                                                    job.status === 'DRAFT' ? 'border-zinc-700 text-zinc-500' :
                                                    'border-red-900/50 text-red-400'
                                                }`}>
                                                    {job.status}
                                                </span>
                                            </div>

                                            {/* Job Info */}
                                            <div className="mt-auto relative z-10 transition-transform duration-500 group-hover:-translate-y-16">
                                                <h3 className="text-2xl font-bold tracking-tight text-white/90 mb-2">{job.title}</h3>
                                                <div className="flex gap-4 text-sm text-zinc-400 mb-4 font-medium">
                                                    <span>{job.location}</span>
                                                    <span>•</span>
                                                    <span>{job.salary} LPA</span>
                                                </div>
                                                <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed">
                                                    {job.description}
                                                </p>
                                            </div>

                                            {/* Slide Up Actions */}
                                            <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex gap-2 justify-center bg-gradient-to-t from-black via-zinc-950/90 to-transparent pt-12">
                                                {job.status === 'DRAFT' && (
                                                    <button 
                                                        onClick={() => handlePublish(job._id)}
                                                        className="px-6 py-3 bg-white text-black text-sm font-semibold rounded-full hover:bg-zinc-200 transition-colors w-full"
                                                    >
                                                        Publish
                                                    </button>
                                                )}
                                                {job.status === 'OPEN' && (
                                                    <button 
                                                        onClick={() => handleViewApplicants(job._id)}
                                                        className="px-6 py-3 bg-white text-black text-sm font-semibold rounded-full hover:bg-zinc-200 transition-colors w-full"
                                                    >
                                                        Applicants
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => {
                                                        setJobToEdit(job);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="px-6 py-3 bg-zinc-800 text-white text-sm font-semibold rounded-full hover:bg-zinc-700 transition-colors"
                                                >
                                                    Edit
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

            <PostJobModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onJobPosted={fetchCompanyJobs} 
                editJob={jobToEdit} 
            />

            <ViewApplicantsModal
                isOpen={isApplicantsModalOpen}
                onClose={() => setIsApplicantsModalOpen(false)}
                jobId={selectedJobId}
            />
        </div>
    );
};

export default CompanyDash;