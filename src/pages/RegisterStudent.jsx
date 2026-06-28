import React, {useState,useEffect} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterStudent =()=>{
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [college, setCollege] = useState('');
    const [error, setError] = useState('');

    const navigate=useNavigate();

    const [collegesList, setCollegesList] = useState([]);
    const [selectedCollegeId, setSelectedCollegeId] = useState('');

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

    const handleRegister=async (e)=>{
        e.preventDefault();
        setError('');

        try {
            await axios.post('http://localhost:8000/api/v1/auth/register/student', 
                { name, email, password, phone, college: selectedCollegeId }
            );
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    }


    return (
        <div className="flex-1 flex items-center justify-center p-8 relative h-full">
            {/* Ambient Background Orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -z-10"></div>
            
            <div className="w-full max-w-md bg-white/[0.02] backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/[0.05] relative overflow-hidden my-8">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center font-black text-white text-3xl shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)] border border-white/20">
                        S
                    </div>
                </div>
                
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 text-center mb-2 tracking-tight">Student Sign Up</h1>
                <p className="text-slate-400 text-center mb-8 font-medium">Join Placxia to launch your career</p>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-red-400 text-sm font-medium">{error}</p>
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleRegister}>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Full Name</label>
                        <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                            className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all shadow-inner"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Email</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all shadow-inner"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Password</label>
                        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all shadow-inner"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Phone Number</label>
                        <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all shadow-inner"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Select Your College</label>
                        <select 
                            required 
                            value={selectedCollegeId} 
                            onChange={(e) => setSelectedCollegeId(e.target.value)}
                            className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all shadow-inner appearance-none"
                        >
                            <option value="" disabled className="bg-slate-900">-- Choose a College --</option>
                            {collegesList.map((col) => (
                                <option key={col._id} value={col._id} className="bg-slate-900 text-white">
                                    {col.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        className="group w-full py-4 mt-6 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all duration-300 shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.6)] flex items-center justify-center gap-2"
                    >
                        Create Account
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RegisterStudent;