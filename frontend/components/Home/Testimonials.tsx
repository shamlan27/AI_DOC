export default function Testimonials() {
    const reviews = [
        {
            id: 1,
            name: "Emily Thompson",
            role: "Patient",
            content: "The AI recommendation was spot on! Dr. Smith diagnosed my issue within minutes. Highly recommended for quick and accurate care.",
            rating: 5,
        },
        {
            id: 2,
            name: "Michael Chen",
            role: "Patient",
            content: "Booking an appointment was seamless. The interface is so easy to use, and I love the prescription upload feature.",
            rating: 5,
        },
        {
            id: 3,
            name: "Sarah Jenkins",
            role: "Patient",
            content: "Great experience. The symptom checker helped me understand what kind of specialist I actually needed.",
            rating: 4,
        },
    ];

    return (
        <section className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">What Our Patients Say</h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Trusted by thousands of patients for accurate recommendations and seamless healthcare access.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((review) => (
                        <div key={review.id} className="glass-card p-8 rounded-2xl hover:bg-white/5 transition-all duration-300">
                            <div className="flex text-yellow-500 mb-4">
                                {[...Array(review.rating)].map((_, i) => (
                                    <span key={i} className="text-lg">★</span>
                                ))}
                            </div>
                            <p className="text-gray-300 italic mb-6 leading-relaxed">&quot;{review.content}&quot;</p>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {review.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">{review.name}</h4>
                                    <p className="text-sm text-blue-400">{review.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
