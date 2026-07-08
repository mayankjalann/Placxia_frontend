import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-zinc-950 border-t border-white/10 pt-16 pb-8 text-white relative z-10 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    
                    <div className="md:col-span-2">
                        <h2 className="text-3xl font-bold tracking-tight mb-6">Placxia.</h2>
                        <p className="text-zinc-400 max-w-sm mb-8 leading-relaxed font-medium">
                            Redefining the collegiate placement experience. We connect elite engineering talent with world-class structural opportunities through an atmospheric, curated platform.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">Portal</h3>
                        <ul className="space-y-4">
                            <li><Link to="/login" className="text-zinc-400 hover:text-white transition-colors">Sign In</Link></li>
                            <li><Link to="/register-student" className="text-zinc-400 hover:text-white transition-colors">Student Access</Link></li>
                            <li><Link to="/register-company" className="text-zinc-400 hover:text-white transition-colors">Partner Access</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">Legal</h3>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Data Security</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-zinc-600 text-sm font-medium">© {new Date().getFullYear()} Placxia. All rights reserved.</p>
                    <p className="text-zinc-600 text-sm font-medium">Designed for Excellence.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
