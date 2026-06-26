import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const [error,setError]=useState('');
    const dispatch=useDispatch();
    const navigate=useNavigate();
    
    const handleSubmit=async (e)=>{
        e.preventDefault();
        setError('');

        try{
            const response = await axios.post('http://localhost:8000/api/v1/auth/login', 
                { email, password },
                { withCredentials: true } 
            );

            const userData=response.data.data.user;

            dispatch(login({userData}));

            navigate('/dashboard');
        }
        catch(err){
            setError(err.response?.data?.message || 'Something went wrong');
            console.log(err);
        }
    }
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-700">
                <h1 className="text-3xl font-bold text-white text-center mb-8">Placxiaa Login</h1>

                {/* The Form */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-slate-300 mb-2">Email Address</label>
                        <input 
                            type="email" 
                            required
                            value={email} // Connects to our bucket
                            onChange={(e) => setEmail(e.target.value)} // Updates our bucket when typing
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white"
                            placeholder="student@college.edu"
                        />
                    </div>

                    <div>
                        <label className="block text-slate-300 mb-2">Password</label>
                        <input 
                            type="password" 
                            required
                            value={password} // Connects to our bucket
                            onChange={(e) => setPassword(e.target.value)} // Updates our bucket when typing
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white"
                            placeholder="••••••••"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;