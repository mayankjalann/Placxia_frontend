import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const AdminDash = () => {
    const userData = useSelector((state) => state.auth.userData);
    
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Add Student State
    const [studentEmail, setStudentEmail] = useState('');
    const [studentRollNo, setStudentRollNo] = useState('');
    const [studentBranch, setStudentBranch] = useState('');
    const [studentBatch, setStudentBatch] = useState('');

    const fetchPendingCompanies = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/v1/admin/getUnapprovedCompanies', {
                withCredentials: true 
            });
            setCompanies(response.data.data);
            setLoading(false);
        } catch (err) {
            setError("Failed to load pending companies");
            setLoading(false);
        }
    };

    const handleApprove = async (companyId) => {
        try {
            await axios.patch(`http://localhost:8000/api/v1/admin/approveCompany/${companyId}`, 
            {}, 
            { withCredentials: true }
            );
            alert("Company Approved! They can now post jobs.");
            fetchPendingCompanies(); // Refresh the list instantly
        } catch (err) {
            alert(err.response?.data?.message || "Failed to approve company");
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/v1/admin/addAllowedStudent', 
                { 
                    email: studentEmail, 
                    rollNo: studentRollNo,
                    branch: studentBranch,
                    batch: studentBatch
                },
                { withCredentials: true }
            );
            alert(`Successfully authorized student: ${studentEmail}`);
            setStudentEmail('');
            setStudentRollNo('');
            setStudentBranch('');
            setStudentBatch('');
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add student");
        }
    };

    useEffect(() => {
        fetchPendingCompanies();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-white">
            <div className="max-w-4xl mx-auto">
                
                <div className="mb-10 border-b border-slate-800 pb-6">
                    <h1 className="text-4xl font-bold tracking-tight">
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-400 text-lg mt-2">
                        Welcome back, <span className="text-indigo-400">{userData?.name}</span>. Review pending company approvals here.
                    </p>
                </div>

                {/* ADD STUDENT SECTION */}
                <div className="mb-10 bg-slate-900 rounded-xl p-6 border border-slate-700 shadow-lg">
                    <h2 className="text-2xl font-bold text-white mb-4">Authorize a Student</h2>
                    <form onSubmit={handleAddStudent} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Student Email</label>
                                <input type="email" required value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none" placeholder="student@college.edu"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Roll Number</label>
                                <input type="text" required value={studentRollNo} onChange={(e) => setStudentRollNo(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none" placeholder="e.g. CS2601"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Branch</label>
                                <input type="text" required value={studentBranch} onChange={(e) => setStudentBranch(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none" placeholder="e.g. Computer Science"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Batch (Year of Graduation)</label>
                                <input type="text" required value={studentBatch} onChange={(e) => setStudentBatch(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none" placeholder="e.g. 2026"/>
                            </div>
                        </div>
                        <div className="flex justify-end mt-2">
                            <button type="submit" className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-indigo-900/20">
                                Authorize Student
                            </button>
                        </div>
                    </form>
                </div>

                {loading && <p className="text-indigo-400 animate-pulse text-xl">Loading companies...</p>}
                {error && <p className="text-red-500 bg-red-500/10 p-4 rounded-lg">{error}</p>}

                {!loading && !error && (
                    <div className="space-y-4">
                        {companies.length === 0 ? (
                            <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
                                <h2 className="text-2xl font-bold text-slate-300">No Pending Approvals</h2>
                                <p className="text-slate-500 mt-2">All companies have been processed.</p>
                            </div>
                        ) : (
                            companies.map((company) => (
                                <div key={company._id} className="bg-slate-900 rounded-xl p-6 border border-slate-700 flex justify-between items-center hover:border-indigo-500 transition-colors shadow-lg">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{company.name}</h3>
                                        <div className="text-slate-400 text-sm mt-2 flex gap-4">
                                            <p>🏢 Industry: {company.industry}</p>
                                            <p>🌐 Website: {company.website}</p>
                                        </div>
                                        <p className="text-slate-500 text-sm mt-3 border-l-2 border-indigo-500 pl-3">
                                            {company.description}
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 ml-4 min-w-[120px]">
                                        <button 
                                            onClick={() => handleApprove(company._id)}
                                            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-green-900/20"
                                        >
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDash;