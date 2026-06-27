import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const PostJobModal = ({ isOpen, onClose, onJobPosted, editJob = null }) => {
    
    const userData = useSelector((state) => state.auth.userData);

    const [colleges, setColleges] = useState([]);
    const [loadingColleges, setLoadingColleges] = useState(true);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        positionsAvailable: 1,
        jobType: 'FULL_TIME',
        deadline: '',
        ctcMin: 0,
        ctcMax: 0,
        eligibleColleges: [] // NOW AN ARRAY!
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            // IF EDITING, PRE-FILL EXISTING DATA
            if (editJob) {
                setFormData({
                    title: editJob.title,
                    description: editJob.description,
                    positionsAvailable: editJob.positionsAvailable,
                    jobType: editJob.jobType,
                    deadline: editJob.deadline ? editJob.deadline.split('T')[0] : '',
                    ctcMin: editJob.ctcMin,
                    ctcMax: editJob.ctcMax,
                    eligibleColleges: editJob.eligibleColleges || [] // LOAD ALL SELECTED COLLEGES
                });
            } else {
                setFormData({
                    title: '', description: '', positionsAvailable: 1, jobType: 'FULL_TIME', deadline: '', ctcMin: 0, ctcMax: 0, eligibleColleges: []
                });
            }

            const fetchColleges = async () => {
                try {
                    const response = await axios.get('http://localhost:8000/api/v1/auth/colleges');
                    const allColleges = response.data.data;
                    const approvedCollegeIds = userData?.companyProfile?.approvedColleges || [];
                    const approvedList = allColleges.filter(c => approvedCollegeIds.includes(c._id));
                    setColleges(approvedList);
                    setLoadingColleges(false);
                } catch (err) {
                    setLoadingColleges(false);
                }
            };
            fetchColleges();
        }
    }, [isOpen, editJob, userData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // CHECKBOX HANDLER! Adds or removes the college ID from the array
    const handleCheckboxChange = (collegeId) => {
        setFormData((prev) => {
            const isSelected = prev.eligibleColleges.includes(collegeId);
            if (isSelected) {
                return { ...prev, eligibleColleges: prev.eligibleColleges.filter(id => id !== collegeId) }; // Remove it
            } else {
                return { ...prev, eligibleColleges: [...prev.eligibleColleges, collegeId] }; // Add it
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // We can just send formData directly now because eligibleColleges is natively an Array!
            if (editJob) {
                await axios.patch(`http://localhost:8000/api/v1/job/update/${editJob._id}`, formData, { withCredentials: true });
                alert("Job Updated Successfully!");
            } else {
                await axios.post('http://localhost:8000/api/v1/job/create', formData, { withCredentials: true });
                alert("Job saved as DRAFT successfully!");
            }
            
            onJobPosted(); 
            onClose(); 
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save job");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                
                <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900">
                    <h2 className="text-2xl font-bold text-white">{editJob ? "Edit Job Posting" : "Post New Job"}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && <p className="text-red-500 bg-red-500/10 p-3 rounded">{error}</p>}

                    <div className="bg-slate-800/50 p-4 rounded-lg border border-indigo-500/30">
                        <label className="block text-indigo-300 font-semibold mb-3">Target Colleges</label>
                        {loadingColleges ? (
                            <p className="text-slate-400">Loading colleges...</p>
                        ) : colleges.length === 0 ? (
                            <p className="text-red-400 text-sm font-bold">You have not been approved for any colleges yet.</p>
                        ) : (
                            <div className="space-y-3 max-h-32 overflow-y-auto">
                                {colleges.map(college => (
                                    <label key={college._id} className="flex items-center space-x-3 text-slate-300 cursor-pointer hover:text-white transition-colors">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.eligibleColleges.includes(college._id)}
                                            onChange={() => handleCheckboxChange(college._id)}
                                            className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-600"
                                        />
                                        <span>{college.name}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-slate-500 mt-3">Select one or more colleges for this job posting.</p>
                    </div>

                    <div>
                        <label className="block text-slate-300 mb-2">Job Title</label>
                        <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" placeholder="e.g. Software Engineer" />
                    </div>

                    <div>
                        <label className="block text-slate-300 mb-2">Description</label>
                        <textarea name="description" required value={formData.description} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white h-32"></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-300 mb-2">Positions Available</label>
                            <input type="number" name="positionsAvailable" required value={formData.positionsAvailable} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" min="1" />
                        </div>
                        <div>
                            <label className="block text-slate-300 mb-2">Job Type</label>
                            <select name="jobType" required value={formData.jobType} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white">
                                <option value="FULL_TIME">Full Time</option>
                                <option value="INTERN">Internship</option>
                                <option value="PPO">PPO</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-300 mb-2">Min CTC (₹)</label>
                            <input type="number" name="ctcMin" value={formData.ctcMin} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" />
                        </div>
                        <div>
                            <label className="block text-slate-300 mb-2">Max CTC (₹)</label>
                            <input type="number" name="ctcMax" value={formData.ctcMax} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-300 mb-2">Application Deadline</label>
                        <input type="date" name="deadline" required value={formData.deadline} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" />
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors">Cancel</button>
                        
                        {/* Disable button if no colleges are checked! */}
                        <button type="submit" disabled={loading || formData.eligibleColleges.length === 0} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50">
                            {loading ? 'Saving...' : (editJob ? 'Update Job' : 'Save as Draft')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostJobModal;