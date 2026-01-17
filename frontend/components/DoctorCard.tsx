import { Doctor } from '../types';

interface DoctorCardProps {
    doctor: Doctor;
    onBook: (doctor: Doctor) => void;
}

export default function DoctorCard({ doctor, onBook }: DoctorCardProps) {
    return (
        <div className="glass-card rounded-2xl overflow-hidden hover:bg-white/5 transition-all duration-300 border border-white/10 flex flex-col md:flex-row group">
            <div className="md:w-1/3 p-6 flex items-center justify-center bg-white/5">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    {/* Placeholder Avatar */}
                    {doctor.name.charAt(0)}
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">{doctor.name}</h3>
                            <p className="text-blue-400 font-medium text-sm border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 rounded-full inline-block">{doctor.specialty}</p>
                        </div>
                        {doctor.rating && (
                            <div className="flex items-center bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                                <span className="text-yellow-500 mr-1 text-xs">★</span>
                                <span className="text-yellow-200 font-bold text-sm">{doctor.rating}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
              ${doctor.availability.includes('Available') ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {doctor.availability}
                        </span>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        onClick={() => onBook(doctor)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-500 transition-colors font-bold shadow-lg shadow-blue-900/40 text-sm"
                    >
                        Book Appointment
                    </button>
                </div>
            </div>
        </div>
    );
}
