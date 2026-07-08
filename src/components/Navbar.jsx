import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../store/authSlice';

const Navbar = () => {
   
    const authStatus = useSelector((state) => state.auth.status);
    const userData = useSelector((state) => state.auth.userData);
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const handleLogout = async () => {
        try {
            await axios.post('https://placxia.vercel.app/api/v1/auth/logout', {}, {
                withCredentials: true
            });
            navigate('/');
            setTimeout(() => {
                dispatch(logout());
            }, 100);
        } catch (err) {
            alert("Failed to logout. Please try again.");
        }
    };

    return (
        <header className="fixed top-0 inset-x-0 z-50 transition-all duration-500 flex justify-center px-4 md:px-8 py-8 pointer-events-none">
            <div className="w-full max-w-7xl flex items-center justify-between pointer-events-auto">
                
                {/* Logo */}
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-500">
                        <path d="M138.54,149.46C106.62,96.25,149.18,43.05,239.63,48.37,245,138.82,191.75,181.39,138.54,149.46ZM16.26,88.26c-3.8,64.61,34.21,95,72.21,72.21C111.27,122.47,80.87,84.46,16.26,88.26Z" opacity="0.2"></path>
                        <path d="M247.63,47.89a8,8,0,0,0-7.52-7.52c-51.76-3-93.32,12.74-111.18,42.22-11.8,19.48-11.78,43.16-.16,65.74a71.37,71.37,0,0,0-14.17,26.95L98.33,159c7.82-16.33,7.52-33.36-1-47.49C84.09,89.73,53.62,78,15.79,80.27a8,8,0,0,0-7.52,7.52c-2.23,37.83,9.46,68.3,31.25,81.5A45.82,45.82,0,0,0,63.44,176,54.58,54.58,0,0,0,87,170.33l25,25V224a8,8,0,0,0,16,0V194.51a55.61,55.61,0,0,1,12.27-35,73.91,73.91,0,0,0,33.31,8.4,60.9,60.9,0,0,0,31.83-8.86C234.89,141.21,250.67,99.65,247.63,47.89ZM86.06,146.74l-24.41-24.4a8,8,0,0,0-11.31,11.31l24.41,24.41c-9.61,3.18-18.93,2.39-26.94-2.46C32.47,146.31,23.79,124.32,24,96c28.31-.25,50.31,8.47,59.6,23.81C88.45,127.82,89.24,137.14,86.06,146.74Zm111.06-1.36c-13.4,8.11-29.15,8.73-45.15,2l53.69-53.7a8,8,0,0,0-11.31-11.32L140.65,136c-6.76-16-6.15-31.76,2-45.15,13.94-23,47-35.8,89.33-34.83C232.94,98.34,220.14,131.44,197.12,145.38Z"></path>
                    </svg>
                    <span className="text-xl font-bold tracking-tighter text-white">Placxia.</span>
                </div>

                {/* Logged in Actions */}
                {authStatus && userData ? (
                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-white font-bold">{userData.name}</p>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{userData.role}</p>
                        </div>

                        {userData.role !== 'ADMIN' && (
                            <button 
                                onClick={() => navigate('/profile')}
                                className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-full transition-colors border border-white/10 flex items-center gap-2 text-sm"
                            >
                                Profile
                            </button>
                        )}

                        <button 
                            onClick={handleLogout}
                            className="px-6 py-2.5 bg-white text-black hover:bg-zinc-200 font-medium rounded-full transition-colors flex items-center gap-2 text-sm"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate('/login')}
                            className="px-6 py-2.5 bg-white text-black hover:bg-zinc-200 font-medium rounded-full transition-colors flex items-center gap-2 text-sm"
                        >
                            Sign In
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;