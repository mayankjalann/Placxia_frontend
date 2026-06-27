import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import PostJobModal from '../components/PostJobModal';
import ViewApplicantsModal from '../components/ViewApplicantsModal';

const CompanyDash = () => {
    const userData = useSelector((state) => state.auth.userData);
    
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // The Post Job / Edit Job Switches
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [jobToEdit, setJobToEdit] = useState(null); // Tracks which job we are editing!

    // The View Applicants Switches
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
            await axios.patch(`http://localhost:8000/api/v1/job/publish/${jobId}`, 
            {}, 
            { withCredentials: true }
            );
            alert("Job Published Successfully!");
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

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-white relative">
            <div className="max-w-6xl mx-auto">
                
                <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">
                            Welcome back, <span className="text-indigo-400">{userData?.name || 'Company'}</span>!
                        </h1>
                        <p className="text-slate-400 text-lg mt-2">
                            Manage your job postings and review applicants.
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => {
                            setJobToEdit(null); // Ensure the form is completely empty for a NEW job!
                            setIsModalOpen(true);
                        }}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                    >
                        + Post New Job
                    </button>
                </div>

                {loading && <p className="text-indigo-400 animate-pulse text-xl">Loading your jobs...</p>}
                {error && <p className="text-red-500 bg-red-500/10 p-4 rounded-lg">{error}</p>}

                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {jobs.length === 0 ? (
                            <div className="col-span-full text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
                                <h2 className="text-2xl font-bold text-slate-300">You haven't posted any jobs yet.</h2>
                                <p className="text-slate-500 mt-2">Click the button above to create your first posting.</p>
                            </div>
                        ) : (
                            jobs.map((job) => (
                                <div key={job._id} className="bg-slate-900 rounded-xl p-6 border border-slate-700 hover:border-indigo-500 transition-all shadow-xl group">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400">
                                            {job.title}
                                        </h3>
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                            job.status === 'OPEN' ? 'bg-green-500/20 text-green-400' : 
                                            job.status === 'DRAFT' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                            {job.status}
                                        </span>
                                    </div>
                                    
                                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                                        {job.description}
                                    </p>

                                    <div className="flex gap-3 mt-6">
                                        
                                        {job.status === 'DRAFT' && (
                                            <button 
                                                onClick={() => handlePublish(job._id)}
                                                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                                            >
                                                🚀 Publish
                                            </button>
                                        )}

                                        {job.status === 'OPEN' && (
                                            <button 
                                                onClick={() => handleViewApplicants(job._id)}
                                                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                                            >
                                                View Applicants
                                            </button>
                                        )}
                                        
                                        {/* THE EDIT BUTTON! */}
                                        <button 
                                            onClick={() => {
                                                setJobToEdit(job); // Send this specific job into the popup!
                                                setIsModalOpen(true);
                                            }}
                                            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors border border-slate-700"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Notice we pass editJob down to the popup here! */}
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