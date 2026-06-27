import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Import our specific Dashboards
import StudentDash from './StudentDash';
import CompanyDash from './CompanyDash';
// import CompanyDash from './CompanyDash'; // (We will build this tomorrow)

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

    // THE TRAFFIC CONTROLLER LOGIC!
    if (userData.role === 'STUDENT') {
        return <StudentDash />;
    } 
    else if (userData.role === 'ADMIN') {
        // We will replace this with <AdminDash /> tomorrow!
        return <div className="min-h-screen bg-slate-950 text-white p-10 text-3xl">Admin Dashboard Under Construction</div>;
    } 
    else if (userData.role === 'COMPANY') {
        // We will replace this with <CompanyDash /> tomorrow!
        return <CompanyDash/>
    }

    // Fallback just in case
    return <div className="text-white">Role not recognized.</div>;
};

export default Dashboard;