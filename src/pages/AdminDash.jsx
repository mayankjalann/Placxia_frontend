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
        <div className="min-h-screen bg-black p-8 text-white">
            <div className="max-w-4xl mx-auto">
                
                <div className="mb-12 border-b border-white/5 pb-8">
                    <h1 className="text-5xl font-bold tracking-tight">
                        Administrative Console
                    </h1>
                    <p className="text-zinc-500 text-lg mt-4 font-medium">
                        Session active: <span className="text-white">{userData?.name}</span>. Review pending applications and manage access.
                    </p>
                </div>

                {/* ADD STUDENT SECTION */}
                <div className="mb-12 bg-zinc-950 rounded-[2rem] p-8 border border-white/10 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Authorize Student Access</h2>
                    <form onSubmit={handleAddStudent} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Student Email</label>
                                <input type="email" required value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} className="w-full px-5 py-4 bg-zinc-900 border border-white/10 rounded-xl text-white focus:border-white/30 focus:outline-none transition-all" placeholder="student@college.edu"/>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Roll Number</label>
                                <input type="text" required value={studentRollNo} onChange={(e) => setStudentRollNo(e.target.value)} className="w-full px-5 py-4 bg-zinc-900 border border-white/10 rounded-xl text-white focus:border-white/30 focus:outline-none transition-all" placeholder="e.g. CS2601"/>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Branch</label>
                                <input type="text" required value={studentBranch} onChange={(e) => setStudentBranch(e.target.value)} className="w-full px-5 py-4 bg-zinc-900 border border-white/10 rounded-xl text-white focus:border-white/30 focus:outline-none transition-all" placeholder="e.g. Computer Science"/>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Batch (Graduation)</label>
                                <input type="text" required value={studentBatch} onChange={(e) => setStudentBatch(e.target.value)} className="w-full px-5 py-4 bg-zinc-900 border border-white/10 rounded-xl text-white focus:border-white/30 focus:outline-none transition-all" placeholder="e.g. 2026"/>
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button type="submit" className="px-10 py-4 bg-white hover:bg-zinc-200 text-black font-medium rounded-full transition-colors w-full md:w-auto">
                                Grant Access
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Pending Partnerships</h2>
                </div>

                {loading && <p className="text-zinc-500 text-xl font-medium">Indexing requests...</p>}
                {error && <p className="text-red-400 bg-red-950/20 p-4 rounded-xl border border-red-900/30">{error}</p>}

                {!loading && !error && (
                    <div className="space-y-6">
                        {companies.length === 0 ? (
                            <div className="text-center py-24 bg-zinc-950 rounded-[2rem] border border-white/5">
                                <h2 className="text-2xl font-bold text-white mb-2">No Pending Approvals</h2>
                                <p className="text-zinc-500 font-medium">All partner applications have been processed.</p>
                            </div>
                        ) : (
                            companies.map((company) => (
                                <div key={company._id} className="bg-zinc-950 rounded-[2rem] p-8 border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-white/30 transition-colors shadow-2xl">
                                    <div className="flex-1">
                                        <h3 className="text-3xl font-bold text-white tracking-tight mb-2">{company.name}</h3>
                                        <div className="text-zinc-400 text-sm flex gap-4 font-medium uppercase tracking-widest mb-4">
                                            <p>{company.industry}</p>
                                            <p>•</p>
                                            <p>{company.website}</p>
                                        </div>
                                        <div className="bg-zinc-900 p-4 rounded-xl border border-white/5">
                                            <p className="text-zinc-300 text-sm leading-relaxed">
                                                {company.description}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 w-full md:w-auto md:ml-6">
                                        <button 
                                            onClick={() => handleApprove(company._id)}
                                            className="px-8 py-4 bg-white hover:bg-zinc-200 text-black font-medium rounded-full transition-colors w-full text-center"
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