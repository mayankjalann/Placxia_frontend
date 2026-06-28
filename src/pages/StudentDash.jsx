import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import JobDetailsModal from '../components/JobDetailsModal';

const StudentDash=()=>{
    const userData=useSelector((state)=> state.auth.userData);

    const navigate=useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [appliedJobs, setAppliedJobs] = useState(new Set());
    const [selectedJobId, setSelectedJobId] = useState(null);

    useEffect(()=>{
        const fetchDashboardData = async()=>{
            try{
                // Fetch both open jobs AND my applications in parallel!
                const [jobsRes, appsRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/v1/job/getAllOpenJobs', { withCredentials: true }),
                    axios.get('http://localhost:8000/api/v1/application/getMyApplications', { withCredentials: true })
                ]);
                
                setJobs(jobsRes.data.data);
                
                // Build a Set of all Job IDs the student has applied to from the DB!
                const appliedIds = new Set(appsRes.data.data.map(app => app.job));
                setAppliedJobs(appliedIds);
                
                setLoading(false);
            }catch (err) {
                setError(err.response?.data?.message || "Failed to load jobs");
                setLoading(false);
            }
        }

        if(userData){
            fetchDashboardData();
        }else{
            navigate('/login');
        }

            // The Apply Logic
    
    },[userData,navigate])

    const handleApply = async (jobId) => {
        try {
            await axios.post(`http://localhost:8000/api/v1/application/applyForJob/${jobId}`, 
            {}, // Empty body because we only need the jobId in the URL
            { withCredentials: true }
            );
            setAppliedJobs(prev => new Set(prev).add(jobId)); // Instantly update the UI
            alert("Successfully applied to the job! 🎉");
        } catch (err) {
            // If the backend says we already applied, just update the UI silently!
            if (err.response?.data?.message === "You have already applied for this job") {
                setAppliedJobs(prev => new Set(prev).add(jobId));
            } else {
                alert(err.response?.data?.message || "Failed to apply");
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-white">
            <div className="max-w-6xl mx-auto">
                
                {/* Header Section */}
                <div className="mb-10 border-b border-slate-800 pb-6">
                    <h1 className="text-4xl font-bold tracking-tight">
                        Welcome back, <span className="text-indigo-400">{userData.name}</span>!
                    </h1>
                    <p className="text-slate-400 text-lg mt-2">
                        Here are the latest placement opportunities for your college.
                    </p>
                </div>
                {/* Loading & Error States */}
                {loading && <p className="text-indigo-400 animate-pulse text-xl">Loading job feed...</p>}
                {error && <p className="text-red-500 bg-red-500/10 p-4 rounded-lg border border-red-500/20">{error}</p>}
                {/* The Job Feed Grid */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {/* If there are no jobs yet */}
                        {jobs.length === 0 ? (
                            <div className="col-span-full text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
                                <h2 className="text-2xl font-bold text-slate-300">No Jobs Posted Yet</h2>
                                <p className="text-slate-500 mt-2">Check back later when companies post openings.</p>
                            </div>
                        ) : (
                            /* Loop through the jobs and make a Card for each one */
                            jobs.map((job) => (
                                <div key={job._id} className="bg-slate-900 rounded-xl p-6 border border-slate-700 hover:border-indigo-500 transition-all shadow-xl group">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                                            {job.title}
                                        </h3>
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
                                            {job.jobType}
                                        </span>
                                    </div>
                                    
                                    <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                                        {job.description}
                                    </p>
                                    
                                    <div className="space-y-2 mb-6">
                                        <p className="text-sm text-slate-300 flex items-center gap-2">
                                            💼 <span className="font-semibold">{job.salary} LPA</span>
                                        </p>
                                        <p className="text-sm text-slate-300 flex items-center gap-2">
                                            📍 <span>{job.location}</span>
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => setSelectedJobId(job._id)}
                                            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors border border-slate-700"
                                        >
                                            View Details
                                        </button>
                                        <button 
                                            onClick={() => handleApply(job._id)}
                                            disabled={appliedJobs.has(job._id)}
                                            className={`flex-1 py-2.5 font-semibold rounded-lg transition-colors ${
                                                appliedJobs.has(job._id) 
                                                ? "bg-green-600/20 text-green-500 cursor-not-allowed border border-green-600/50" 
                                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                            }`}
                                        >
                                            {appliedJobs.has(job._id) ? "Applied ✓" : "Apply Now"}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
                
                {/* The Deep Details Modal */}
                {selectedJobId && (
                    <JobDetailsModal 
                        jobId={selectedJobId} 
                        onClose={() => setSelectedJobId(null)}
                        hasApplied={appliedJobs.has(selectedJobId)}
                        onApply={handleApply}
                    />
                )}
            </div>
        </div>
    );

}

export default StudentDash;