import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';

const ProfileModal = ({ isOpen, onClose, userData }) => {
    if (!isOpen || !userData) return null;

    const dispatch = useDispatch();
    const isStudent = userData.role === 'STUDENT';
    const isCompany = userData.role === 'COMPANY';

    // 1. Unified State Object
    const [formData, setFormData] = useState({
        cgpa: userData.studentProfile?.cgpa || '',
        skills: userData.studentProfile?.skills?.join(', ') || '',
        linkedinUrl: userData.studentProfile?.linkedinUrl || '',
        website: userData.companyProfile?.website || '',
        description: userData.companyProfile?.description || '',
    });

    // 2. Separate State for Files
    const [file, setFile] = useState(null); 
    const [loading, setLoading] = useState(false);

    // 3. Unified Change Handler
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const submitData = new FormData();
            let url = '';

            if (isStudent) {
                url = 'http://localhost:8000/api/v1/auth/update-student';
                if (formData.cgpa) submitData.append('cgpa', formData.cgpa);
                if (formData.linkedinUrl) submitData.append('linkedinUrl', formData.linkedinUrl);
                
                if (formData.skills) {
                    // Send skills as a JSON array string since Multer FormData strips native arrays easily
                    // But wait, our backend expects an array. Let's send them individually.
                    const skillArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
                    skillArray.forEach(skill => submitData.append('skills[]', skill));
                }

                if (file) submitData.append('resume', file); // 'resume' matches backend multer
            } 
            else if (isCompany) {
                url = 'http://localhost:8000/api/v1/auth/update-company';
                if (formData.website) submitData.append('website', formData.website);
                if (formData.description) submitData.append('description', formData.description);
                if (file) submitData.append('logo', file); // 'logo' matches backend multer
            }

            await axios.patch(url, submitData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert("Profile updated successfully!");

            // Refresh Redux Data!
            const userResponse = await axios.get('http://localhost:8000/api/v1/auth/current-user', {
                withCredentials: true
            });
            const updatedUserData = userResponse.data.data;
            dispatch(login({ userData: updatedUserData }));

            onClose();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-950 border border-white/10 rounded-[2rem] w-full max-w-2xl p-10 relative shadow-2xl">
                
                <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white bg-zinc-900 hover:bg-zinc-800 w-10 h-10 rounded-full flex items-center justify-center transition-all">✕</button>

                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">
                    Edit Profile
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* STUDENT INPUTS */}
                    {isStudent && (
                        <>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">CGPA</label>
                                <input 
                                    type="number" step="0.01" max="10" name="cgpa" 
                                    value={formData.cgpa} onChange={handleChange} 
                                    className="w-full px-5 py-4 bg-zinc-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 transition-all" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Skills (comma separated)</label>
                                <input 
                                    type="text" name="skills" 
                                    value={formData.skills} onChange={handleChange} 
                                    placeholder="React, Node.js, AWS"
                                    className="w-full px-5 py-4 bg-zinc-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 transition-all" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">LinkedIn URL</label>
                                <input 
                                    type="url" name="linkedinUrl" 
                                    value={formData.linkedinUrl} onChange={handleChange} 
                                    className="w-full px-5 py-4 bg-zinc-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 transition-all" 
                                />
                            </div>
                            <div className="p-6 bg-zinc-900/50 rounded-2xl border border-white/5 mt-4">
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Upload Resume (PDF)</label>
                                <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="text-zinc-400 block w-full file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-white file:text-black hover:file:bg-zinc-200 cursor-pointer transition-colors"/>
                                {userData.studentProfile?.resumeUrl && !file && (
                                    <p className="text-xs text-zinc-400 mt-4 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-black bg-white rounded-full p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                                        Resume is already uploaded.
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {/* COMPANY INPUTS */}
                    {isCompany && (
                        <>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Company Website</label>
                                <input 
                                    type="url" name="website" 
                                    value={formData.website} onChange={handleChange} 
                                    className="w-full px-5 py-4 bg-zinc-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 transition-all" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Company Description</label>
                                <textarea 
                                    rows="4" name="description" 
                                    value={formData.description} onChange={handleChange} 
                                    className="w-full px-5 py-4 bg-zinc-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 transition-all resize-none" 
                                />
                            </div>
                            <div className="p-6 bg-zinc-900/50 rounded-2xl border border-white/5 mt-4">
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Upload Company Logo (Image)</label>
                                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="text-zinc-400 block w-full file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-white file:text-black hover:file:bg-zinc-200 cursor-pointer transition-colors"/>
                                {userData.companyProfile?.logoUrl && !file && (
                                    <div className="mt-4 flex items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-white/5">
                                        <img src={userData.companyProfile.logoUrl} alt="Logo" className="w-12 h-12 rounded-lg bg-white p-2 object-contain" />
                                        <p className="text-xs text-zinc-400 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-black bg-white rounded-full p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                                            Logo is already uploaded.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <div className="pt-4">
                        <button type="submit" disabled={loading} className="py-4 bg-white hover:bg-zinc-200 text-black font-medium rounded-full w-full transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? "Processing..." : "Save Changes"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default ProfileModal;
