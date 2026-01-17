"use client";

import Link from 'next/link';

export default function About() {
    return (
        <div className="min-h-screen bg-[#030712] text-gray-100 relative overflow-hidden">
            {/* Animated Background */}
            <div className="aurora-bg">
                <div className="aurora-blob blob-1"></div>
                <div className="aurora-blob blob-2"></div>
                <div className="aurora-blob blob-3"></div>
            </div>

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="pt-32 pb-20 text-center px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="inline-block mb-6 px-4 py-1.5 rounded-full glass-panel text-sm font-bold text-blue-400 border border-blue-500/20">
                            🚀 Our Mission
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
                            Revolutionizing <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Healthcare with AI</span>
                        </h1>
                        <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-12">
                            We are building the world's most advanced AI medical assistant to provide instant, accurate, and accessible healthcare to everyone, everywhere.
                        </p>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-20 bg-black/20 backdrop-blur-sm border-y border-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="rounded-3xl overflow-hidden glass-card border border-white/10 mb-20 relative text-center md:text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                <div className="h-64 md:h-auto relative">
                                    <img src="/emergency-care.jpg" alt="Compassionate Care" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-blue-900/30 mix-blend-multiply"></div>
                                </div>
                                <div className="p-10 flex flex-col justify-center">
                                    <h3 className="text-3xl font-bold text-white mb-6">Compassion at Core</h3>
                                    <p className="text-gray-300 leading-relaxed mb-6">
                                        Technology is our tool, but care is our purpose. From home care support to emergency services for expectant mothers, we believe in healthcare that feels human.
                                    </p>
                                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                        <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-blue-200">❤️ Patient First</span>
                                        <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-blue-200">🚑 24/7 Support</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { title: "Innovation", desc: "Pushing the boundaries of what's possible with Generative AI and Medical LLMs.", icon: "💡" },
                                { title: "Accessibility", desc: "Making world-class medical diagnosis available to anyone with a smartphone.", icon: "🌍" },
                                { title: "Trust & Safety", desc: "Prioritizing patient data privacy and clinical accuracy above all else.", icon: "🛡️" },
                            ].map((value, i) => (
                                <div key={i} className="glass-card p-8 rounded-3xl border border-white/10 hover:-translate-y-2 transition-transform duration-300">
                                    <div className="text-4xl mb-6">{value.icon}</div>
                                    <h3 className="text-2xl font-bold text-white mb-4">{value.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{value.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="py-32 px-4">
                    <div className="max-w-7xl mx-auto text-center">
                        <h2 className="text-4xl font-bold text-white mb-16">Meet the <span className="text-blue-500">Visionaries</span></h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="group cursor-pointer">
                                    <div className="relative overflow-hidden rounded-3xl aspect-[4/5] mb-6 glass-card border border-white/10">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                                        {/* Placeholder Avatar */}
                                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-gray-600 text-5xl font-bold group-hover:scale-105 transition-transform duration-500">
                                            👨‍💻
                                        </div>
                                        <div className="absolute bottom-6 left-6 z-20 text-left">
                                            <h4 className="text-xl font-bold text-white">Team Member {i}</h4>
                                            <p className="text-blue-400 text-sm">Co-Founder</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 text-center">
                    <div className="glass-panel max-w-4xl mx-auto rounded-3xl p-12 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]"></div>
                        <h2 className="text-3xl font-bold text-white mb-6 relative z-10">Join us in shaping the future</h2>
                        <p className="text-gray-400 mb-8 max-w-xl mx-auto relative z-10">Whether you are a doctor, developer, or partner, we'd love to work with you.</p>
                        <Link href="/contact" className="inline-block relative z-10 px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
                            Get in Touch
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
