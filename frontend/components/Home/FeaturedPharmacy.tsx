import Link from 'next/link';
import Image from 'next/image';

export default function FeaturedPharmacy() {
    return (
        <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="glass-panel rounded-3xl p-8 md:p-12 border border-white/10">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        {/* Content */}
                        <div className="flex-1 space-y-6">
                            <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-300 text-sm font-semibold border border-blue-500/30">
                                New Service
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                Order Your Medicines <span className="text-blue-400">Instantly</span>
                            </h2>
                            <p className="text-lg text-gray-400">
                                Get genuine medicines delivered to your doorstep within 2 hours.
                                Partnered with top-rated pharmacies for your safety and convenience.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link
                                    href="#"
                                    className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                                >
                                    Order Now
                                </Link>
                                <Link
                                    href="#"
                                    className="inline-flex items-center justify-center px-8 py-3 bg-transparent text-white font-semibold rounded-xl border border-white/20 hover:bg-white/5 transition"
                                >
                                    Upload Prescription
                                </Link>
                            </div>
                            <div className="flex items-center gap-6 pt-6 text-sm text-gray-400 font-medium">
                                <div className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span> Genuine Products
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span> Fast Delivery
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span> 24/7 Support
                                </div>
                            </div>
                        </div>

                        {/* Image Placeholder */}
                        <div className="flex-1 w-full relative h-80 md:h-[400px] rounded-2xl overflow-hidden shadow-2xl bg-black/40 group border border-white/10">
                            {/* Using a gradient placeholder since I don't have an image asset yet */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-cyan-900/20 flex items-center justify-center">
                                <div className="text-center p-8">
                                    <span className="text-6xl mb-4 block animate-bounce">💊</span>
                                    <p className="text-gray-500 font-medium">Pharmacy Integration Visual</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
