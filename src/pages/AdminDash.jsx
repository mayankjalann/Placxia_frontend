import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { parseStudentCsv } from '../utils/parseStudentCsv';
import { useToast } from '../components/ToastContext';

const AdminDash = () => {
    const userData = useSelector((state) => state.auth.userData);
    const toast = useToast();
    
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Add Student State
    const [studentEmail, setStudentEmail] = useState('');
    const [studentRollNo, setStudentRollNo] = useState('');
    const [studentBranch, setStudentBranch] = useState('');
    const [studentBatch, setStudentBatch] = useState('');
    const [analytics, setAnalytics] = useState(null);
    const [analyticsError, setAnalyticsError] = useState('');
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [bulkRows, setBulkRows] = useState([]);
    const [bulkError, setBulkError] = useState('');
    const [bulkResult, setBulkResult] = useState(null);
    const [bulkLoading, setBulkLoading] = useState(false);

    const fetchPendingCompanies = async () => {
        try {
            const response = await axios.get('/api/v1/admin/getUnapprovedCompanies', {
                withCredentials: true 
            });
            setCompanies(response.data.data);
            setError('');
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load pending companies");
            setLoading(false);
        }
    };

    const fetchAnalytics = useCallback(async () => {
        setAnalyticsError('');
        try {
            const response = await axios.get('/api/v1/admin/analytics', { withCredentials: true });
            setAnalytics(response.data.data);
        } catch (err) {
            setAnalyticsError(err.response?.data?.message || 'Could not load placement analytics.');
        } finally {
            setAnalyticsLoading(false);
        }
    }, []);

    const handleApprove = async (companyId) => {
        try {
            await axios.patch(`/api/v1/admin/approveCompany/${companyId}`,
            {}, 
            { withCredentials: true }
            );
            toast("Company approved. They can now post jobs.");
            fetchPendingCompanies(); // Refresh the list instantly
        } catch (err) {
            toast(err.response?.data?.message || "Failed to approve company", 'error');
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/v1/admin/addAllowedStudent',
                { 
                    email: studentEmail, 
                    rollNo: studentRollNo,
                    branch: studentBranch,
                    batch: studentBatch
                },
                { withCredentials: true }
            );
            toast(`Authorized student: ${studentEmail}`);
            setStudentEmail('');
            setStudentRollNo('');
            setStudentBranch('');
            setStudentBatch('');
            fetchAnalytics();
        } catch (err) {
            toast(err.response?.data?.message || "Failed to add student", 'error');
        }
    };

    useEffect(() => {
        fetchPendingCompanies();
        fetchAnalytics();
        const refreshIfVisible = () => {
            if (document.visibilityState !== 'visible') return;
            fetchPendingCompanies();
            fetchAnalytics();
        };
        const timer = window.setInterval(refreshIfVisible, 30000);
        window.addEventListener('focus', refreshIfVisible);
        document.addEventListener('visibilitychange', refreshIfVisible);
        return () => {
            window.clearInterval(timer);
            window.removeEventListener('focus', refreshIfVisible);
            document.removeEventListener('visibilitychange', refreshIfVisible);
        };
    }, [fetchAnalytics]);

    const handleCsvFile = async (event) => {
        setBulkError('');
        setBulkResult(null);
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const rows = parseStudentCsv(await file.text());
            if (rows.length > 500) throw new Error('Please upload no more than 500 rows at a time.');
            setBulkRows(rows);
        } catch (parseError) {
            setBulkRows([]);
            setBulkError(parseError.message || 'Could not read this CSV.');
        }
    };

    const importStudents = async () => {
        setBulkLoading(true);
        setBulkError('');
        try {
            const response = await axios.post('/api/v1/admin/bulk-allowed-students', { students: bulkRows }, { withCredentials: true });
            setBulkResult(response.data.data);
            setBulkRows([]);
            fetchAnalytics();
        } catch (err) {
            setBulkError(err.response?.data?.message || 'Could not import students.');
        } finally {
            setBulkLoading(false);
        }
    };

    const exportAnalytics = () => {
        if (!analytics) return;
        const csvRows = [
            ['Summary metric', 'Value'],
            ['Authorized students', analytics.authorizedStudents],
            ['Registered students', analytics.totalStudents],
            ['Placed students', analytics.placedStudents],
            ['Placement rate', `${analytics.placementRate}%`],
            ['Open jobs', analytics.openJobs],
            ['Applications', analytics.applications],
            ['Approved companies', analytics.approvedCompanies],
            ['Pending companies', analytics.pendingCompanies],
            ['Offers sent', analytics.offerStats?.total],
            ['Offers accepted', analytics.offerStats?.accepted],
            ['Offers declined', analytics.offerStats?.declined],
            ['Offers pending', analytics.offerStats?.pending],
            ['Average accepted package (LPA)', analytics.offerStats?.averageAcceptedPackage],
            ['Highest accepted package (LPA)', analytics.offerStats?.highestAcceptedPackage],
            [],
            ['Branch', 'Registered', 'Authorized', 'Placed', 'Placement rate'],
            ...(analytics.branchStats || []).map((item) => [item._id, item.students, item.authorized, item.placed, `${item.placementRate}%`]),
            [],
            ['Batch', 'Registered', 'Placed', 'Placement rate'],
            ...(analytics.batchStats || []).map((item) => [item._id, item.students, item.placed, `${item.placementRate}%`]),
            [],
            ['Application stage', 'Applications'],
            ...(analytics.applicationFunnel || []).map((item) => [item.status, item.count]),
            [],
            ['Company', 'Jobs', 'Applicants', 'Offers', 'Accepted offers'],
            ...(analytics.topCompanies || []).map((item) => [item.companyName, item.jobs, item.applicants, item.offers, item.acceptedOffers]),
            [],
            ['Month', 'Accepted offers'],
            ...(analytics.monthlyAcceptedOffers || []).map((item) => [item._id, item.placements]),
        ];
        const csv = csvRows.map((row) => row.map((cell) => {
            const value = String(cell ?? '');
            const safeValue = /^[=+@\-\t\r]/.test(value) ? `'${value}` : value;
            return `"${safeValue.replaceAll('"', '""')}"`;
        }).join(',')).join('\n');
        const link = document.createElement('a');
        const objectUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        link.href = objectUrl;
        link.download = 'placxia-placement-analytics.csv';
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    };

    return (
        <div className="min-h-screen bg-black p-8 text-white">
            <div className="max-w-7xl mx-auto">
                
                <div className="mb-12 border-b border-white/5 pb-8">
                    <h1 className="text-5xl font-bold tracking-tight">
                        Administrative Console
                    </h1>
                    <p className="text-zinc-500 text-lg mt-4 font-medium">
                        Session active: <span className="text-white">{userData?.name}</span>. Review pending applications and manage access.
                    </p>
                </div>

                <section className="mb-12 rounded-[2rem] border border-white/10 bg-zinc-950 p-6 md:p-8">
                    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                        <div><h2 className="text-2xl font-bold">Placement analytics</h2><p className="mt-1 text-sm text-zinc-500">College-scoped placement activity, recruiting funnel, and offer outcomes.</p></div>
                        <div className="flex gap-3">
                            <button type="button" onClick={fetchAnalytics} disabled={analyticsLoading} className="rounded-full border border-white/15 px-5 py-3 text-sm text-white disabled:opacity-40">{analyticsLoading ? 'Refreshing…' : 'Refresh'}</button>
                            <button type="button" onClick={exportAnalytics} disabled={!analytics || analyticsLoading} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black disabled:opacity-40">Export CSV</button>
                        </div>
                    </div>
                    {analyticsError && <p role="alert" className="mb-4 text-sm text-rose-300">{analyticsError}</p>}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">
                        {[
                            ['Authorized students', analytics?.authorizedStudents], ['Registered students', analytics?.totalStudents],
                            ['Placed students', analytics?.placedStudents], ['Placement rate', `${analytics?.placementRate ?? 0}%`],
                            ['Open jobs', analytics?.openJobs], ['Applications', analytics?.applications],
                            ['Approved companies', analytics?.approvedCompanies], ['Pending companies', analytics?.pendingCompanies],
                            ['Accepted offers', analytics?.offerStats?.accepted], ['Avg accepted package', `${analytics?.offerStats?.averageAcceptedPackage ?? 0} LPA`],
                        ].map(([label, value]) => <div key={label} className="rounded-xl border border-white/5 bg-black/40 p-4"><p className="text-xs uppercase tracking-widest text-zinc-500">{label}</p><p className="mt-2 text-xl font-semibold text-white">{analyticsLoading && !analytics ? '…' : value ?? '—'}</p></div>)}
                    </div>

                    <div className="mt-8 grid gap-6 xl:grid-cols-2">
                        <div className="rounded-2xl border border-white/5 bg-black/30 p-5">
                            <h3 className="text-lg font-semibold">Branch-wise placement</h3>
                            <p className="mb-4 mt-1 text-xs text-zinc-500">Registered = student profiles; authorized = allowlist entries.</p>
                            <div className="overflow-x-auto"><table className="w-full min-w-[34rem] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-zinc-500"><tr><th className="py-2">Branch</th><th>Authorized</th><th>Registered</th><th>Placed</th><th>Rate</th></tr></thead><tbody>{(analytics?.branchStats || []).map((row) => <tr key={row._id} className="border-t border-white/5"><td className="py-3 font-semibold text-white">{row._id}</td><td className="text-zinc-400">{row.authorized}</td><td className="text-zinc-300">{row.students}</td><td className="text-zinc-300">{row.placed}</td><td className="min-w-28 text-emerald-300">{row.placementRate}%<div className="mt-1 h-1.5 rounded-full bg-zinc-800"><div className="h-1.5 rounded-full bg-emerald-400" style={{ width: `${row.placementRate}%` }} /></div></td></tr>)}</tbody></table>{!analyticsLoading && !analytics?.branchStats?.length && <p className="py-6 text-sm text-zinc-500">No registered students or authorized students yet.</p>}</div>
                        </div>
                        <div className="rounded-2xl border border-white/5 bg-black/30 p-5">
                            <h3 className="text-lg font-semibold">Graduation batch-wise placement</h3>
                            <p className="mb-4 mt-1 text-xs text-zinc-500">Placed students divided by registered students in each batch.</p>
                            <div className="overflow-x-auto"><table className="w-full min-w-[25rem] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-zinc-500"><tr><th className="py-2">Batch</th><th>Registered</th><th>Placed</th><th>Rate</th></tr></thead><tbody>{(analytics?.batchStats || []).map((row) => <tr key={row._id} className="border-t border-white/5"><td className="py-3 font-semibold text-white">{row._id}</td><td>{row.students}</td><td>{row.placed}</td><td className="text-emerald-300">{row.placementRate}%</td></tr>)}</tbody></table>{!analyticsLoading && !analytics?.batchStats?.length && <p className="py-6 text-sm text-zinc-500">No registered batch data yet.</p>}</div>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-6 xl:grid-cols-2">
                        <div className="rounded-2xl border border-white/5 bg-black/30 p-5">
                            <h3 className="text-lg font-semibold">Application funnel</h3>
                            <p className="mb-4 mt-1 text-xs text-zinc-500">Current application state across jobs available to this college.</p>
                            <div className="space-y-4">{(analytics?.applicationFunnel || []).map((stage) => <div key={stage.status}><div className="mb-1 flex justify-between text-sm"><span className="text-zinc-300">{stage.status.replace('_', ' ')}</span><span className="text-white">{stage.count}</span></div><div className="h-2 rounded-full bg-zinc-800"><div className="h-2 rounded-full bg-indigo-300" style={{ width: `${analytics?.applications ? (stage.count / analytics.applications) * 100 : 0}%` }} /></div></div>)}{analytics?.applications === 0 && <p className="py-3 text-sm text-zinc-500">No applications yet.</p>}</div>
                        </div>
                        <div className="rounded-2xl border border-white/5 bg-black/30 p-5">
                            <h3 className="text-lg font-semibold">Offer outcomes</h3>
                            <p className="mb-4 mt-1 text-xs text-zinc-500">Offer decisions and accepted package levels.</p>
                            <div className="grid grid-cols-2 gap-3">{[['Sent', analytics?.offerStats?.total], ['Pending', analytics?.offerStats?.pending], ['Accepted', analytics?.offerStats?.accepted], ['Declined', analytics?.offerStats?.declined], ['Average accepted', `${analytics?.offerStats?.averageAcceptedPackage ?? 0} LPA`], ['Highest accepted', `${analytics?.offerStats?.highestAcceptedPackage ?? 0} LPA`]].map(([label, value]) => <div key={label} className="rounded-xl bg-zinc-900/70 p-4"><p className="text-xs text-zinc-500">{label}</p><p className="mt-1 font-semibold text-white">{value ?? '—'}</p></div>)}</div>
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-white/5 bg-black/30 p-5">
                        <h3 className="text-lg font-semibold">Top recruiting companies</h3>
                        <p className="mb-4 mt-1 text-xs text-zinc-500">Ranked by applicant volume for jobs targeting your college.</p>
                        <div className="overflow-x-auto"><table className="w-full min-w-[36rem] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-zinc-500"><tr><th className="py-2">Company</th><th>Jobs</th><th>Applicants</th><th>Offers</th><th>Accepted</th></tr></thead><tbody>{(analytics?.topCompanies || []).map((company) => <tr key={company.companyId} className="border-t border-white/5"><td className="py-3 font-medium text-white">{company.companyName}</td><td>{company.jobs}</td><td>{company.applicants}</td><td>{company.offers}</td><td className="text-emerald-300">{company.acceptedOffers}</td></tr>)}</tbody></table>{!analyticsLoading && !analytics?.topCompanies?.length && <p className="py-6 text-sm text-zinc-500">No company job activity yet.</p>}</div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-white/5 bg-black/30 p-5">
                        <h3 className="text-lg font-semibold">Accepted offers over time</h3>
                        <p className="mb-4 mt-1 text-xs text-zinc-500">Monthly accepted offers over the last 12 months.</p>
                        <div className="flex min-h-36 items-end gap-2 overflow-x-auto pb-2">{(analytics?.monthlyAcceptedOffers || []).map((month) => {
                            const maxCount = Math.max(1, ...(analytics?.monthlyAcceptedOffers || []).map((item) => item.placements));
                            return <div key={month._id} title={`${month._id}: ${month.placements} accepted offers`} className="flex min-w-10 flex-1 flex-col items-center gap-2"><span className="text-xs text-zinc-400">{month.placements}</span><div className="w-full rounded-t-md bg-emerald-400/80" style={{ height: `${Math.max(8, (month.placements / maxCount) * 90)}px` }} /><span className="text-[10px] text-zinc-500">{month._id}</span></div>;
                        })}{!analyticsLoading && !analytics?.monthlyAcceptedOffers?.length && <p className="py-6 text-sm text-zinc-500">No accepted offers in the last 12 months.</p>}</div>
                    </div>
                </section>

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
                                <select required value={studentBranch} onChange={(e) => setStudentBranch(e.target.value)} className="w-full px-5 py-4 bg-zinc-900 border border-white/10 rounded-xl text-white focus:border-white/30 focus:outline-none transition-all">
                                    <option value="" disabled>Select a branch</option>
                                    <option value="CSE">Computer Science (CSE)</option>
                                    <option value="IT">Information Technology (IT)</option>
                                    <option value="ECE">Electronics (ECE)</option>
                                    <option value="EE">Electrical (EE)</option>
                                    <option value="ME">Mechanical (ME)</option>
                                    <option value="CE">Civil (CE)</option>
                                    <option value="OTHER">Other</option>
                                </select>
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

                <section className="mb-12 rounded-[2rem] border border-white/10 bg-zinc-950 p-8">
                    <h2 className="mb-2 text-2xl font-bold">Bulk authorize students</h2>
                    <p className="mb-5 text-sm text-zinc-500">CSV columns: email, rollNo, branch, batch. Up to 500 rows per import.</p>
                    <input type="file" accept=".csv,text/csv" onChange={handleCsvFile} className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-5 file:py-3 file:font-medium file:text-black" />
                    {bulkRows.length > 0 && <div className="mt-5 space-y-3"><p className="text-sm text-emerald-300">{bulkRows.length} rows ready to import.</p><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-zinc-500"><tr><th className="p-2">Email</th><th className="p-2">Roll no.</th><th className="p-2">Branch</th><th className="p-2">Batch</th></tr></thead><tbody>{bulkRows.slice(0, 5).map((row) => <tr key={row.rowNumber} className="border-t border-white/5"><td className="p-2">{row.email}</td><td className="p-2">{row.rollNo}</td><td className="p-2">{row.branch}</td><td className="p-2">{row.batch}</td></tr>)}</tbody></table></div><button type="button" onClick={importStudents} disabled={bulkLoading} className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black disabled:opacity-50">{bulkLoading ? 'Importing…' : 'Import students'}</button></div>}
                    {bulkError && <p role="alert" className="mt-4 text-sm text-rose-300">{bulkError}</p>}
                    {bulkResult && <div className="mt-4 rounded-xl bg-black/40 p-4 text-sm"><p className="text-emerald-300">Imported {bulkResult.imported} students.</p>{bulkResult.rejected.length > 0 && <ul className="mt-2 space-y-1 text-amber-200">{bulkResult.rejected.map((row) => <li key={row.row}>Row {row.row} ({row.email}): {row.reason}</li>)}</ul>}</div>}
                </section>

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
