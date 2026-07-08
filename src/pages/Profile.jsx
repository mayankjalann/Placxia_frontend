import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import ProfileModal from '../components/ProfileModal';

const Profile = () => {
    const { status, userData } = useSelector((state) => state.auth);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    if (!status || !userData) {
        return <Navigate to="/login" />;
    }

    const isStudent = userData.role === 'STUDENT';
    const isCompany = userData.role === 'COMPANY';
    const isAdmin = userData.role === 'ADMIN';

    return (
        <div className="p-8 pt-32 relative bg-black min-h-screen text-white">
            <div className="max-w-5xl mx-auto">
                
                {/* Hero Header Section */}
                <div className="bg-zinc-950 border border-white/10 rounded-[2rem] p-10 mb-8 overflow-hidden shadow-2xl relative">
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                        <div className="flex items-center gap-8">
                            {isCompany && userData.companyProfile?.logoUrl ? (
                                <img 
                                    src={userData.companyProfile.logoUrl} 
                                    alt="Company Logo" 
                                    className="w-28 h-28 rounded-2xl bg-white p-3 border border-white/10 object-contain ring-1 ring-white/5 transition-transform duration-500 hover:scale-105"
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-2xl bg-white flex items-center justify-center text-5xl font-bold text-black border border-white/10">
                                    {userData.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            
                            <div>
                                <h1 className="text-5xl font-bold tracking-tight text-white mb-2">
                                    {userData.name}
                                </h1>
                                <div className="flex items-center gap-4 mt-4">
                                    <span className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full">
                                        {userData.role}
                                    </span>
                                    <span className="text-zinc-400 font-medium flex items-center gap-2">
                                        <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {userData.email}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {!isAdmin && (
                            <button 
                                onClick={() => setIsProfileOpen(true)}
                                className="group relative px-8 py-4 bg-white hover:bg-zinc-200 text-black font-medium rounded-full transition-colors flex items-center gap-3"
                            >
                                <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column (Main Details) */}
                    <div className="lg:col-span-2 space-y-8">
                        {isStudent && (
                            <>
                                <div className="bg-zinc-950 border border-white/10 rounded-[2rem] p-8 hover:border-white/30 transition-colors duration-500 shadow-2xl">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-2 bg-white rounded-xl">
                                            <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-3xl font-bold tracking-tight">Skills & Expertise</h2>
                                    </div>
                                    
                                    {userData.studentProfile?.skills?.length > 0 ? (
                                        <div className="flex flex-wrap gap-3">
                                            {userData.studentProfile.skills.map((skill, index) => (
                                                <span 
                                                    key={index} 
                                                    className="px-6 py-3 bg-zinc-900 text-white rounded-xl text-sm font-semibold border border-white/10 cursor-default"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="px-6 py-10 border border-dashed border-white/10 rounded-2xl text-center">
                                            <p className="text-zinc-500 italic">No skills added yet. Stand out to companies by adding your expertise.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-zinc-950 border border-white/10 rounded-[2rem] p-8 hover:border-white/30 transition-colors duration-500 shadow-2xl">
                                    <div className="flex justify-between items-center mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-xl">
                                                <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <h2 className="text-3xl font-bold tracking-tight">Professional Resume</h2>
                                        </div>
                                    </div>
                                    
                                    {userData.studentProfile?.resumeUrl ? (
                                        <a 
                                            href={userData.studentProfile.resumeUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="group relative w-full flex items-center justify-between px-8 py-6 bg-zinc-900 border border-white/10 rounded-2xl transition-all duration-300 overflow-hidden"
                                        >
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-white/10">
                                                    <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white group-hover:text-zinc-300 transition-colors">{userData.name}'s Resume.pdf</h3>
                                                    <p className="text-zinc-500 text-sm mt-1">Click to view securely in a new tab</p>
                                                </div>
                                            </div>
                                            <div className="relative z-10 p-3 bg-zinc-800 rounded-xl group-hover:bg-zinc-700 transition-all border border-white/5">
                                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </div>
                                        </a>
                                    ) : (
                                        <div className="text-center py-10 bg-zinc-900 rounded-2xl border border-dashed border-white/10 relative overflow-hidden group hover:border-white/30 transition-colors">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-500">
                                                <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                            </div>
                                            <p className="text-zinc-500 mb-6 font-medium">Your profile is incomplete without a resume.</p>
                                            <button onClick={() => setIsProfileOpen(true)} className="px-6 py-3 bg-white hover:bg-zinc-200 text-black font-medium rounded-full transition-all">
                                                Upload Resume Now
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {isCompany && (
                            <div className="bg-zinc-950 border border-white/10 rounded-[2rem] p-8 hover:border-white/30 transition-colors duration-500 shadow-2xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-white rounded-xl">
                                        <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <h2 className="text-3xl font-bold tracking-tight">About the Company</h2>
                                </div>
                                <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
                                    <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap font-medium">
                                        {userData.companyProfile?.description || <span className="italic text-zinc-500">No description provided yet. Complete your profile to attract top talent.</span>}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column (Sidebar Details) */}
                    <div className="space-y-8">
                        {isStudent && (
                            <div className="bg-zinc-950 border border-white/10 rounded-[2rem] p-8 hover:border-white/30 transition-colors duration-500 shadow-2xl">
                                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">
                                    Academic Record
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center p-6 bg-zinc-900 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                                                <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                                </svg>
                                            </div>
                                            <p className="text-zinc-400 font-medium">CGPA</p>
                                        </div>
                                        <p className="text-3xl font-bold text-white tracking-tight">{userData.studentProfile?.cgpa || '--'}</p>
                                    </div>
                                    
                                    <div className="space-y-4 pt-4">
                                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">Branch</p>
                                            <p className="text-lg font-bold text-white">{userData.studentProfile?.branch}</p>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">Batch</p>
                                            <p className="text-lg font-bold text-white">{userData.studentProfile?.batch}</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">Roll No</p>
                                            <p className="text-lg font-bold text-white">{userData.studentProfile?.rollNo}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">
                                        Connect
                                    </h3>
                                    {userData.studentProfile?.linkedinUrl ? (
                                        <a href={userData.studentProfile.linkedinUrl} target="_blank" rel="noreferrer" className="group flex items-center justify-between p-4 bg-zinc-900 hover:bg-zinc-800 rounded-2xl border border-white/5 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                                </div>
                                                <span className="font-bold text-zinc-300 group-hover:text-white transition-colors">LinkedIn</span>
                                            </div>
                                            <svg className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
                                    ) : (
                                        <p className="text-zinc-500 text-sm italic px-4">No LinkedIn linked</p>
                                    )}
                                    {userData.studentProfile?.githubUrl ? (
                                        <a href={userData.studentProfile.githubUrl} target="_blank" rel="noreferrer" className="group flex items-center justify-between p-4 bg-zinc-900 hover:bg-zinc-800 rounded-2xl border border-white/5 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                                </div>
                                                <span className="font-bold text-zinc-300 group-hover:text-white transition-colors">GitHub</span>
                                            </div>
                                            <svg className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
                                    ) : (
                                        <p className="text-zinc-500 text-sm italic px-4">No GitHub linked</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {isCompany && (
                            <div className="bg-zinc-950 border border-white/10 rounded-[2rem] p-8 hover:border-white/30 transition-colors duration-500 shadow-2xl">
                                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">
                                    Company Details
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">Industry Focus</p>
                                        <div className="inline-block px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl">
                                            <p className="text-lg font-bold text-white">{userData.companyProfile?.industry}</p>
                                        </div>
                                    </div>
                                    {userData.companyProfile?.website && (
                                        <div className="mt-8 pt-8 border-t border-white/10">
                                            <a href={userData.companyProfile.website} target="_blank" rel="noreferrer" className="group flex items-center justify-center gap-2 w-full px-6 py-4 bg-white hover:bg-zinc-200 text-black font-medium rounded-full transition-all">
                                                Visit Official Website
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                </div>

            </div>
            
            <ProfileModal 
                isOpen={isProfileOpen} 
                onClose={() => setIsProfileOpen(false)} 
                userData={userData} 
            />
        </div>
    );
};

export default Profile;
