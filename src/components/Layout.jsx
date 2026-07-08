import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useDispatch } from "react-redux";
import { login, logout } from "../store/authSlice";
import axios from "axios";

function Layout() {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Automatically fetch the user when they refresh the page!
        axios.get('https://placxia.vercel.app/api/v1/auth/current-user', { withCredentials: true })
        .then((response) => {
            dispatch(login({ userData: response.data.data }));
        })
        .catch(() => {
            dispatch(logout());
        })
        .finally(() => setLoading(false));
    }, [dispatch]);

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