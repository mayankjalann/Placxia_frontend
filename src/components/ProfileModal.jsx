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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-8 relative shadow-2xl">
                
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full transition-colors">✕</button>

                <h2 className="text-3xl font-black text-white mb-6 border-b border-slate-700 pb-4">
                    Edit Profile
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* STUDENT INPUTS */}
                    {isStudent && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">CGPA</label>
                                <input 
                                    type="number" step="0.01" max="10" name="cgpa" 
                                    value={formData.cgpa} onChange={handleChange} 
                                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Skills (comma separated)</label>
                                <input 
                                    type="text" name="skills" 
                                    value={formData.skills} onChange={handleChange} 
                                    placeholder="React, Node.js, AWS"
                                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">LinkedIn URL</label>
                                <input 
                                    type="url" name="linkedinUrl" 
                                    value={formData.linkedinUrl} onChange={handleChange} 
                                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" 
                                />
                            </div>
                            <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 mt-4">
                                <label className="block text-sm font-medium text-slate-300 mb-2">Upload Resume (PDF)</label>
                                <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="text-slate-400 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"/>
                                {userData.studentProfile?.resumeUrl && !file && (
                                    <p className="text-xs text-green-400 mt-2">✓ Resume is already uploaded on Cloudinary.</p>
                                )}
                            </div>
                        </>
                    )}

                    {/* COMPANY INPUTS */}
                    {isCompany && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Company Website</label>
                                <input 
                                    type="url" name="website" 
                                    value={formData.website} onChange={handleChange} 
                                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Company Description</label>
                                <textarea 
                                    rows="4" name="description" 
                                    value={formData.description} onChange={handleChange} 
                                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white resize-none" 
                                />
                            </div>
                            <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 mt-4">
                                <label className="block text-sm font-medium text-slate-300 mb-2">Upload Company Logo (Image)</label>
                                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="text-slate-400 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"/>
                                {userData.companyProfile?.logoUrl && !file && (
                                    <div className="mt-4 flex items-center gap-4">
                                        <img src={userData.companyProfile.logoUrl} alt="Logo" className="w-12 h-12 rounded bg-white p-1" />
                                        <p className="text-xs text-green-400">✓ Logo is uploaded on Cloudinary.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <button type="submit" disabled={loading} className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg w-full transition-colors shadow-lg shadow-indigo-600/30 disabled:opacity-50">
                        {loading ? "Saving to Cloudinary..." : "Save Profile"}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default ProfileModal;
