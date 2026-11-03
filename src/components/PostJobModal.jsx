import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useToast } from './ToastContext';

const PostJobModal = ({ isOpen, onClose, onJobPosted, editJob = null }) => {
    const toast = useToast();
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
        cgpaCutoff: 0,
        tenthCutoff: 0,
        twelfthCutoff: 0,
        requiredSkills: '',
        allowedBranches: '',
        batchEligible: '',
        eligibleColleges: [] // NOW AN ARRAY!
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        // Initialize the draft only when opening or switching between listings.
        // Auth/profile refreshes must never overwrite text the user is typing.
        if (editJob) {
            setFormData({
                title: editJob.title,
                description: editJob.description,
                positionsAvailable: editJob.positionsAvailable,
                jobType: editJob.jobType,
                deadline: editJob.deadline ? editJob.deadline.split('T')[0] : '',
                ctcMin: editJob.ctcMin,
                ctcMax: editJob.ctcMax,
                cgpaCutoff: editJob.cgpaCutoff || 0,
                tenthCutoff: editJob.tenthCutoff || 0,
                twelfthCutoff: editJob.twelfthCutoff || 0,
                requiredSkills: editJob.requiredSkills?.join(', ') || '',
                allowedBranches: editJob.allowedBranches?.join(', ') || '',
                batchEligible: editJob.batchEligible?.join(', ') || '',
                eligibleColleges: editJob.eligibleColleges || []
            });
        } else {
            setFormData({
                title: '', description: '', positionsAvailable: 1, jobType: 'FULL_TIME', deadline: '', ctcMin: 0, ctcMax: 0,
                cgpaCutoff: 0, tenthCutoff: 0, twelfthCutoff: 0, requiredSkills: '', allowedBranches: '', batchEligible: '', eligibleColleges: []
            });
        }
        setError('');
    }, [isOpen, editJob]);

    const approvedCollegeIds = userData?.companyProfile?.approvedColleges || [];
    const approvedCollegeKey = approvedCollegeIds.map((id) => id.toString()).sort().join(',');

    useEffect(() => {
        if (!isOpen) return;
        let active = true;
        setLoadingColleges(true);
        const fetchColleges = async () => {
            try {
                const response = await axios.get('/api/v1/auth/colleges');
                if (!active) return;
                const allColleges = response.data.data;
                const approvedIds = new Set(approvedCollegeKey ? approvedCollegeKey.split(',') : []);
                setColleges(allColleges.filter((college) => approvedIds.has(college._id)));
                setError('');
            } catch (err) {
                if (active) setError(err.response?.data?.message || 'Could not load approved colleges.');
            } finally {
                if (active) setLoadingColleges(false);
            }
        };
        fetchColleges();
        return () => { active = false; };
    }, [isOpen, approvedCollegeKey]);

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

        if (Number(formData.ctcMax) < Number(formData.ctcMin)) {
            setError('Maximum package must be at least the minimum package.');
            setLoading(false);
            return;
        }
        if (formData.deadline < new Date().toISOString().slice(0, 10)) {
            setError('Choose today or a future application deadline.');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                ...formData,
                requiredSkills: formData.requiredSkills.split(',').map((item) => item.trim()).filter(Boolean),
                allowedBranches: formData.allowedBranches.split(',').map((item) => item.trim().toUpperCase()).filter(Boolean),
                batchEligible: formData.batchEligible.split(',').map((item) => item.trim()).filter(Boolean),
            };
            // We can just send formData directly now because eligibleColleges is natively an Array!
            if (editJob) {
                await axios.patch(`/api/v1/job/update/${editJob._id}`, payload, { withCredentials: true });
                toast("Job updated successfully.");
            } else {
                await axios.post('/api/v1/job/create', payload, { withCredentials: true });
                toast("Job saved as draft successfully.");
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-950 rounded-[2rem] border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-950">
                    <h2 className="text-3xl font-bold text-white tracking-tight">{editJob ? "Edit Listing" : "Post New Listing"}</h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white text-3xl transition-colors">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto">
                    {error && <p className="text-red-400 bg-red-950/20 p-4 rounded-xl border border-red-900/30">{error}</p>}

                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                        <label className="block text-white font-medium mb-4">Target Universities</label>
                        {loadingColleges ? (
                            <p className="text-zinc-500">Loading directory...</p>
                        ) : colleges.length === 0 ? (
                            <p className="text-red-400 text-sm font-medium">You have not been approved for any universities.</p>
                        ) : (
                            <div className="space-y-4 max-h-40 overflow-y-auto pr-2">
                                {colleges.map(college => (
                                    <label key={college._id} className="flex items-center space-x-4 text-zinc-400 cursor-pointer hover:text-white transition-colors">
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${formData.eligibleColleges.includes(college._id) ? 'bg-white border-white' : 'border-zinc-700 bg-zinc-900'}`}>
                                            {formData.eligibleColleges.includes(college._id) && (
                                                <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                                            )}
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={formData.eligibleColleges.includes(college._id)}
                                            onChange={() => handleCheckboxChange(college._id)}
                                            className="hidden"
                                        />
                                        <span className="font-medium">{college.name}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-zinc-500 mt-4 uppercase tracking-widest">Select eligible institutions</p>
                    </div>

                    <div>
                        <label className="block text-zinc-400 text-sm font-medium mb-2 uppercase tracking-widest">Role Title</label>
                        <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="e.g. Structural Engineer" />
                    </div>

                    <div>
                        <label className="block text-zinc-400 text-sm font-medium mb-2 uppercase tracking-widest">Description</label>
                        <textarea name="description" required value={formData.description} onChange={handleChange} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white h-32 focus:outline-none focus:border-white/30 transition-colors"></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-zinc-400 text-sm font-medium mb-2 uppercase tracking-widest">Headcount</label>
                            <input type="number" name="positionsAvailable" required value={formData.positionsAvailable} onChange={handleChange} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-white/30 transition-colors" min="1" />
                        </div>
                        <div>
                            <label className="block text-zinc-400 text-sm font-medium mb-2 uppercase tracking-widest">Type</label>
                            <select name="jobType" required value={formData.jobType} onChange={handleChange} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-white/30 transition-colors">
                                <option value="FULL_TIME">Full Time</option>
                                <option value="INTERN">Internship</option>
                                <option value="PPO">PPO</option>
                            </select>
                        </div>
                    </div>

                    <section className="space-y-4 rounded-2xl border border-white/5 bg-zinc-900/40 p-5">
                        <div><h3 className="font-semibold text-white">Eligibility and matching</h3><p className="mt-1 text-xs text-zinc-500">Students must meet the criteria you set here to view and apply.</p></div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <label className="text-xs uppercase tracking-widest text-zinc-400">Minimum CGPA<input type="number" name="cgpaCutoff" min="0" max="10" step="0.01" value={formData.cgpaCutoff} onChange={handleChange} className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 text-white" /></label>
                            <label className="text-xs uppercase tracking-widest text-zinc-400">10th cutoff %<input type="number" name="tenthCutoff" min="0" max="100" step="0.01" value={formData.tenthCutoff} onChange={handleChange} className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 text-white" /></label>
                            <label className="text-xs uppercase tracking-widest text-zinc-400">12th cutoff %<input type="number" name="twelfthCutoff" min="0" max="100" step="0.01" value={formData.twelfthCutoff} onChange={handleChange} className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 text-white" /></label>
                        </div>
                        <input name="requiredSkills" value={formData.requiredSkills} onChange={handleChange} placeholder="Required skills, comma separated" className="w-full rounded-xl border border-white/10 bg-zinc-900 p-3 text-sm text-white" />
                        <input name="allowedBranches" value={formData.allowedBranches} onChange={handleChange} placeholder="Branches (CSE, IT); leave blank for all" className="w-full rounded-xl border border-white/10 bg-zinc-900 p-3 text-sm text-white" />
                        <input name="batchEligible" value={formData.batchEligible} onChange={handleChange} placeholder="Graduation batches (2026, 2027); leave blank for all" className="w-full rounded-xl border border-white/10 bg-zinc-900 p-3 text-sm text-white" />
                    </section>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-zinc-400 text-sm font-medium mb-2 uppercase tracking-widest">Min Package</label>
                            <input type="number" name="ctcMin" min="0" value={formData.ctcMin} onChange={handleChange} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-white/30 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-zinc-400 text-sm font-medium mb-2 uppercase tracking-widest">Max Package</label>
                            <input type="number" name="ctcMax" min="0" value={formData.ctcMax} onChange={handleChange} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-white/30 transition-colors" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-zinc-400 text-sm font-medium mb-2 uppercase tracking-widest">Deadline</label>
                        <input type="date" name="deadline" required value={formData.deadline} onChange={handleChange} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-white/30 transition-colors [color-scheme:dark]" />
                    </div>

                    <div className="pt-8 flex gap-4 border-t border-white/5">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-full transition-colors">Cancel</button>
                        
                        <button type="submit" disabled={loading || formData.eligibleColleges.length === 0} className="flex-[2] py-4 bg-white text-black hover:bg-zinc-200 font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Processing...' : (editJob ? 'Update Archive' : 'Save Draft')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostJobModal;
