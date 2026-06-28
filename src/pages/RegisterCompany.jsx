import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterCompany = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', industry: '', website: '', description: '', requestedColleges: []
    });
    
    const [collegesList, setCollegesList] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchColleges = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/v1/auth/colleges');
                setCollegesList(response.data.data);
            } catch (err) {
                console.log("Failed to fetch colleges");
            }
        };
        fetchColleges();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (collegeId) => {
        setFormData((prev) => {
            const isSelected = prev.requestedColleges.includes(collegeId);
            if (isSelected) {
                return { ...prev, requestedColleges: prev.requestedColleges.filter(id => id !== collegeId) };
            } else {
                return { ...prev, requestedColleges: [...prev.requestedColleges, collegeId] };
            }
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.requestedColleges.length === 0) {
            setError("You must request at least one college to partner with.");
            return;
        }

        try {
            await axios.post('http://localhost:8000/api/v1/auth/register/company', formData);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 4000); // Send them to login after 4 seconds
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-8 relative h-full">
            {/* Ambient Background Orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10"></div>
            
            <div className="w-full max-w-2xl bg-white/[0.02] backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/[0.05] relative overflow-hidden my-8">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center font-black text-white text-3xl shadow-[0_0_30px_-5px_rgba(168,85,247,0.5)] border border-white/20">
                        C
                    </div>
                </div>

                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 text-center mb-2 tracking-tight">Company Registration</h1>
                <p className="text-slate-400 text-center mb-8 font-medium">Partner with top colleges to hire their best students.</p>
                
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-red-400 text-sm font-medium">{error}</p>
                    </div>
                )}
                
                {success ? (
                    <div className="p-8 bg-green-500/10 border border-green-500/30 rounded-2xl text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-2xl font-black text-green-400 mb-2">Application Submitted!</h2>
                        <p className="text-green-200 font-medium">Your request has been sent to the college admins for approval. You will be redirected to Login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Company Name</label>
                                <input type="text" name="name" required onChange={handleChange} className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-inner" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Industry Focus</label>
                                <input type="text" name="industry" required onChange={handleChange} placeholder="e.g. Technology" className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-inner" />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Email (Login ID)</label>
                                <input type="email" name="email" required onChange={handleChange} className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-inner" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Password</label>
                                <input type="password" name="password" required onChange={handleChange} className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-inner" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Company Website URL</label>
                            <input type="text" name="website" required onChange={handleChange} className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-inner" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Company Description</label>
                            <textarea name="description" required onChange={handleChange} className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-inner h-24 resize-none"></textarea>
                        </div>

                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-inner">
                            <label className="block text-sm font-bold text-indigo-300 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                Request Partnership with Colleges:
                            </label>
                            <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {collegesList.map((col) => (
                                    <label key={col._id} className="flex items-center space-x-3 text-slate-300 cursor-pointer hover:text-white transition-colors group p-2 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.requestedColleges.includes(col._id)}
                                            onChange={() => handleCheckboxChange(col._id)}
                                            className="w-5 h-5 rounded bg-white/10 border-white/20 text-purple-600 focus:ring-purple-600 focus:ring-offset-slate-900 transition-all"
                                        />
                                        <span className="font-medium">{col.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="group w-full py-4 mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-300 shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.6)] flex items-center justify-center gap-2">
                            Submit Application
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default RegisterCompany;