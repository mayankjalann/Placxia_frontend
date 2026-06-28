import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden">
            
            {/* Cool Glowing Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="z-10 text-center max-w-3xl px-6 mt-10">
                
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 font-semibold text-sm mb-8 shadow-xl shadow-slate-900">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    Now live for 2026 Batch Placements
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 leading-tight">
                    The Modern Way to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Get Hired</span>
                </h1>
                
                <p className="text-slate-400 text-xl mb-12 leading-relaxed">
                    Connecting top tier companies with the brightest minds. A unified platform for students, recruiters, and placement cells.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30 text-lg">
                        Login to Account
                    </Link>
                    <Link to="/register-student" className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all border border-slate-700 text-lg hover:border-slate-500">
                        Student Sign Up
                    </Link>
                    <Link to="/register-company" className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all border border-slate-700 text-lg hover:border-slate-500">
                        Company Sign Up
                    </Link>
                </div>
            </div>
            
            {/* Fake Stats to make it look Enterprise level */}
            <div className="z-10 mt-24 mb-10 grid grid-cols-1 md:grid-cols-3 gap-12 text-center border-t border-slate-800 pt-12 w-full max-w-4xl px-6">
                <div>
                    <h3 className="text-5xl font-black text-white">500+</h3>
                    <p className="text-slate-400 mt-2 font-bold uppercase tracking-wider text-sm">Hiring Companies</p>
                </div>
                <div>
                    <h3 className="text-5xl font-black text-white">10k+</h3>
                    <p className="text-slate-400 mt-2 font-bold uppercase tracking-wider text-sm">Offers Made</p>
                </div>
                <div>
                    <h3 className="text-5xl font-black text-white">50LPA</h3>
                    <p className="text-slate-400 mt-2 font-bold uppercase tracking-wider text-sm">Highest Package</p>
                </div>
            </div>
        </div>
    );
};

export default Home;