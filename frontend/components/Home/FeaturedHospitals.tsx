export default function FeaturedHospitals() {
    return (
        <div className="w-full py-10 bg-black/20 backdrop-blur-sm border-y border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-gray-400 font-medium mb-6 uppercase tracking-wider text-sm">
                    Trusted by 100+ Hospitals & Healthcare Providers
                </p>
                <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Placeholder logos for hospitals - using generic icons/text for demo */}
                    {['Mayo Clinic', 'Cleveland Clinic', 'Johns Hopkins', 'UCLA Health', 'Sinai Hospital'].map((name, i) => (
                        <div key={i} className="flex items-center gap-2 group cursor-pointer hover:opacity-100 transition-opacity">
                            <span className="text-2xl">🏥</span>
                            <span className="text-xl font-bold text-gray-300 group-hover:text-white">{name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
