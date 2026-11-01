import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useDispatch } from "react-redux";
import { login, logout } from "../store/authSlice";
import axios from "axios";

function Layout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [sessionError, setSessionError] = useState('');
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let active = true;
        const handleExpiredSession = () => {
            dispatch(logout());
            navigate('/login', { replace: true });
        };

        window.addEventListener('placxia:session-expired', handleExpiredSession);

        setLoading(true);
        setSessionError('');
        axios.get('https://placxia.vercel.app/api/v1/auth/current-user', { withCredentials: true })
        .then((response) => {
            if (active) dispatch(login({ userData: response.data.data }));
        })
        .catch((error) => {
            if (!active) return;
            if (error.response?.status === 401) {
                dispatch(logout());
            } else {
                setSessionError('Could not restore your session. Check your connection and try again.');
            }
        })
        .finally(() => {
            if (active) setLoading(false);
        });

        return () => {
            active = false;
            window.removeEventListener('placxia:session-expired', handleExpiredSession);
        };
    }, [dispatch, navigate, retryCount]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    if (sessionError) {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center gap-5 px-6 text-center">
                <p className="text-zinc-300">{sessionError}</p>
                <button
                    type="button"
                    onClick={() => setRetryCount((count) => count + 1)}
                    className="rounded-full bg-white px-6 py-3 font-medium text-black"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-black text-white flex flex-col selection:bg-white/20 antialiased overflow-x-hidden">
            <Navbar />
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>  
    )
};

export default Layout;
