import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { lazyWithRecovery } from '../utils/lazyWithRecovery.js';

const StudentDash = lazyWithRecovery(() => import('./StudentDash.jsx'));
const CompanyDash = lazyWithRecovery(() => import('./CompanyDash.jsx'));
const AdminDash = lazyWithRecovery(() => import('./AdminDash.jsx'));

const Dashboard = () => {
    const userData = useSelector((state) => state.auth.userData);
    const navigate = useNavigate();

    // If the user isn't logged in, kick them out!
    useEffect(() => {
        if (!userData) {
            navigate('/login');
        }
    }, [userData, navigate]);

    // If still checking, show a loading screen
    if (!userData) {
        return <div className="min-h-screen bg-slate-950 text-white p-10">Loading Dashboard...</div>;
    }

    if (userData.role === 'STUDENT') {
        return <StudentDash />;
    } 
    else if (userData.role === 'ADMIN') {
        return <AdminDash/>
    } 
    else if (userData.role === 'COMPANY') {
        return <CompanyDash/>
    }

    // Fallback just in case
    return <div className="text-white">Role not recognized.</div>;
};

export default Dashboard;
