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
        <div className="flex-1 flex items-center justify-center p-8 relative min-h-[90vh]">
            
            <div className="w-full max-w-md bg-zinc-950 rounded-[2rem] p-10 border border-white/10 relative overflow-hidden my-8">
                
                <div className="flex justify-center mb-10">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="w-10 h-10 text-white group-hover:rotate-12 transition-transform duration-500">
                            <path d="M138.54,149.46C106.62,96.25,149.18,43.05,239.63,48.37,245,138.82,191.75,181.39,138.54,149.46ZM16.26,88.26c-3.8,64.61,34.21,95,72.21,72.21C111.27,122.47,80.87,84.46,16.26,88.26Z" opacity="0.2"></path>
                            <path d="M247.63,47.89a8,8,0,0,0-7.52-7.52c-51.76-3-93.32,12.74-111.18,42.22-11.8,19.48-11.78,43.16-.16,65.74a71.37,71.37,0,0,0-14.17,26.95L98.33,159c7.82-16.33,7.52-33.36-1-47.49C84.09,89.73,53.62,78,15.79,80.27a8,8,0,0,0-7.52,7.52c-2.23,37.83,9.46,68.3,31.25,81.5A45.82,45.82,0,0,0,63.44,176,54.58,54.58,0,0,0,87,170.33l25,25V224a8,8,0,0,0,16,0V194.51a55.61,55.61,0,0,1,12.27-35,73.91,73.91,0,0,0,33.31,8.4,60.9,60.9,0,0,0,31.83-8.86C234.89,141.21,250.67,99.65,247.63,47.89ZM86.06,146.74l-24.41-24.4a8,8,0,0,0-11.31,11.31l24.41,24.41c-9.61,3.18-18.93,2.39-26.94-2.46C32.47,146.31,23.79,124.32,24,96c28.31-.25,50.31,8.47,59.6,23.81C88.45,127.82,89.24,137.14,86.06,146.74Zm111.06-1.36c-13.4,8.11-29.15,8.73-45.15,2l53.69-53.7a8,8,0,0,0-11.31-11.32L140.65,136c-6.76-16-6.15-31.76,2-45.15,13.94-23,47-35.8,89.33-34.83C232.94,98.34,220.14,131.44,197.12,145.38Z"></path>
                        </svg>
                    </div>
                </div>
                
                <h1 className="text-3xl font-bold text-white text-center mb-2 tracking-tight">Student Access</h1>
                <p className="text-zinc-500 text-center mb-8 font-medium">Join the curated network.</p>

                {error && (
                    <div className="mb-6 p-4 bg-red-950/20 border border-red-900/30 rounded-xl flex items-start gap-3">
                        <p className="text-red-400 text-sm font-medium">{error}</p>
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleRegister}>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block">Full Name</label>
                        <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                            className="w-full px-5 py-4 bg-zinc-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 transition-all"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block">Email</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 bg-zinc-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 transition-all"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block">Password</label>
                        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 bg-zinc-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 transition-all"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block">Phone Number</label>
                        <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-5 py-4 bg-zinc-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 transition-all"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block">Select Your College</label>
                        <select 
                            required 
                            value={selectedCollegeId} 
                            onChange={(e) => setSelectedCollegeId(e.target.value)}
                            className="w-full px-5 py-4 bg-zinc-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 transition-all appearance-none"
                        >
                            <option value="" disabled className="bg-zinc-950">-- Choose a College --</option>
                            {collegesList.map((col) => (
                                <option key={col._id} value={col._id} className="bg-zinc-950 text-white">
                                    {col.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full py-4 mt-8 bg-white hover:bg-zinc-200 text-black font-medium rounded-full transition-colors flex items-center justify-center gap-2"
                    >
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterStudent;