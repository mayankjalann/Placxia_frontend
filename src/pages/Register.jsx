import React, {useState,useEffect} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register =()=>{
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
                setCollegesList(response.data.data); // Drop the list of colleges into our bucket!
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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-slate-700">
                <h1 className="text-3xl font-bold text-white text-center mb-8">Join Placxiaa</h1>
                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                        {error}
                    </div>
                )}
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                        <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                        <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                        />
                    </div>
                    {/* NEW: The Beautiful Dropdown Menu! */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Select Your College</label>
                        <select 
                            required 
                            value={selectedCollegeId} 
                            onChange={(e) => setSelectedCollegeId(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                        >
                            <option value="" disabled>-- Choose a College --</option>
                            
                            {/* We loop through the collegesList bucket and turn them into HTML options! */}
                            {collegesList.map((col) => (
                                <option key={col._id} value={col._id}>
                                    {col.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg">
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Register;