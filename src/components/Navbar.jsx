import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../store/authSlice';

const Navbar = () => {
   
    // Check if we are logged in and get our data!
    const authStatus = useSelector((state) => state.auth.status);
    const userData = useSelector((state) => state.auth.userData);
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const handleLogout = async () => {
        try {
            // 1. Tell backend to delete our cookies
            await axios.post('http://localhost:8000/api/v1/auth/logout', {}, {
                withCredentials: true
            });
            // 2. Kick us back to the Home screen FIRST!
            navigate('/');
            
            // 3. Clear Redux! (Delay it slightly so the router can transition without Dashboard intercepting it)
            setTimeout(() => {
                dispatch(logout());
            }, 100);
        } catch (err) {
            alert("Failed to logout. Please try again.");
        }
    };

    return (
        <nav className="w-full bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/[0.05] px-8 py-4 flex justify-between items-center shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] sticky top-0 z-50 transition-all duration-300">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center font-black text-white text-2xl shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] border border-white/20 ring-2 ring-indigo-500/20">
                    P
                </div>
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Placxia</h1>
            </div>

            {/* ONLY SHOW LOGOUT IF WE ARE LOGGED IN */}
            {authStatus && userData && (
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-white font-bold">{userData.name}</p>
                        <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest">{userData.role}</p>
                    </div>

                    {userData.role !== 'ADMIN' && (
                        <button 
                            onClick={() => navigate('/profile')}
                            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white font-bold rounded-xl transition-all duration-300 border border-white/10 shadow-sm hover:shadow-indigo-500/20 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile
                        </button>
                    )}

                    <button 
                        onClick={handleLogout}
                        className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white font-bold rounded-xl transition-all duration-300 border border-red-500/20 hover:shadow-[0_0_20px_-5px_rgba(239,68,68,0.5)] flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;