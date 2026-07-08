import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const Home = () => {
    return (
        <div className="bg-black text-white min-h-screen font-sans selection:bg-zinc-800 selection:text-white">
            
            {/* Hero Section */}
            <section className="relative min-h-[90vh] w-full flex flex-col md:flex-row items-center pt-24 pb-12 overflow-hidden px-6 md:px-12 max-w-7xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black z-0 pointer-events-none"></div>
                
                <div className="relative w-full md:w-1/2 z-10 flex flex-col items-start pr-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span className="inline-block py-1.5 px-4 rounded-full border border-white/20 bg-white/5 text-white/80 text-xs font-semibold tracking-widest uppercase mb-8 backdrop-blur-sm">
                            Platform & Archive
                        </span>
                        
                        <h1 className="text-6xl md:text-7xl lg:text-[100px] font-bold tracking-tighter leading-[0.9] text-white mb-8 text-balance uppercase">
                            PLACXIA
                            <span className="text-white/60 text-3xl md:text-5xl italic font-normal font-serif block mt-6 tracking-normal normal-case">— Architecting the future of elite talent.</span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-[40ch] mb-12 text-balance">
                            We design pathways between exceptional talent and structural engineering teams. Rejecting the generic job board for curated, atmospheric placements.
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4">
                            <Link to="/register-student" className="relative inline-flex items-center justify-center font-medium overflow-hidden rounded-full transition-colors focus:outline-none py-3 tracking-tight h-14 px-8 text-base bg-white text-black hover:bg-zinc-200">
                                Enter as Student
                            </Link>
                            <Link to="/register-company" className="relative inline-flex items-center justify-center font-medium overflow-hidden rounded-full transition-colors focus:outline-none py-3 tracking-tight bg-transparent border border-white/20 h-14 px-8 text-base text-white hover:bg-white/10">
                                Enter as Company
                            </Link>
                        </div>
                    </motion.div>
                </div>

                <div className="relative w-full md:w-1/2 mt-16 md:mt-0 z-10 flex justify-end">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full aspect-[4/5] md:aspect-[3/4] max-h-[70vh] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl"
                    >
                        <div className="absolute inset-0 bg-black/20 z-10"></div>
                        <img 
                            src="/hero.png" 
                            alt="Editorial Hero" 
                            className="w-full h-full object-cover grayscale mix-blend-luminosity opacity-80 hover:grayscale-0 hover:opacity-100 hover:mix-blend-normal transition-all duration-1000"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Curated Assemblages (Stats / Features) */}
            <section className="py-24 md:py-32 bg-zinc-950 relative z-10">
                <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 gap-8">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Curated Assemblages.</h2>
                            <p className="text-zinc-400 max-w-[40ch]">Living career ecosystems designed for atmospheric presence. Not just roles, but structural talent statements.</p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                        {/* Card 1 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="md:col-span-4 group cursor-pointer md:mt-0"
                        >
                            <div className="w-full bg-zinc-900 relative overflow-hidden rounded-[2rem] mb-6 aspect-[3/4] border border-white/5 group-hover:border-white/20 transition-colors">
                                <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/50 to-zinc-950/50"></div>
                                <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                                    <div className="text-6xl font-serif italic text-white/20">01</div>
                                    <h3 className="text-3xl font-bold tracking-tight text-white/90">500+</h3>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex justify-center z-20">
                                    <span className="bg-white/90 backdrop-blur-md text-zinc-900 text-sm font-semibold px-6 py-3 rounded-full shadow-lg">View Network</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-medium tracking-tight text-white group-hover:text-zinc-300 transition-colors">Active Partners</h3>
                                <span className="text-lg text-zinc-500">Global</span>
                            </div>
                        </motion.div>

                        {/* Card 2 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="md:col-span-4 group cursor-pointer md:mt-24"
                        >
                            <div className="w-full bg-zinc-900 relative overflow-hidden rounded-[2rem] mb-6 aspect-square border border-white/5 group-hover:border-white/20 transition-colors">
                                <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/50 to-zinc-950/50"></div>
                                <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                                    <div className="text-6xl font-serif italic text-white/20">02</div>
                                    <h3 className="text-3xl font-bold tracking-tight text-white/90">10k+</h3>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex justify-center z-20">
                                    <span className="bg-white/90 backdrop-blur-md text-zinc-900 text-sm font-semibold px-6 py-3 rounded-full shadow-lg">View Successes</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-medium tracking-tight text-white group-hover:text-zinc-300 transition-colors">Offers Extended</h3>
                                <span className="text-lg text-zinc-500">Verified</span>
                            </div>
                        </motion.div>

                        {/* Card 3 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="md:col-span-4 group cursor-pointer md:mt-12"
                        >
                            <div className="w-full bg-zinc-900 relative overflow-hidden rounded-[2rem] mb-6 aspect-[4/5] border border-white/5 group-hover:border-white/20 transition-colors">
                                <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/50 to-zinc-950/50"></div>
                                <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                                    <div className="text-6xl font-serif italic text-white/20">03</div>
                                    <h3 className="text-3xl font-bold tracking-tight text-white/90">50L</h3>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex justify-center z-20">
                                    <span className="bg-white/90 backdrop-blur-md text-zinc-900 text-sm font-semibold px-6 py-3 rounded-full shadow-lg">View Details</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-medium tracking-tight text-white group-hover:text-zinc-300 transition-colors">Highest Package</h3>
                                <span className="text-lg text-zinc-500">LPA</span>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </section>
        </div>
    );
};

export default Home;