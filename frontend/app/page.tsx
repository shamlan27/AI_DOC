import SymptomInput from '../components/SymptomInput';
import MedicalReportAnalyzer from '../components/Home/MedicalReportAnalyzer';
import Testimonials from '../components/Home/Testimonials';
import FeaturedHospitals from '../components/Home/FeaturedHospitals';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden text-[#F9FAFB]">
      {/* Animated Aurora Background */}
      <div className="aurora-bg">
        <div className="aurora-blob blob-1"></div>
        <div className="aurora-blob blob-2"></div>
        <div className="aurora-blob blob-3"></div>
      </div>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

          <div className="inline-block mb-6 px-4 py-1.5 rounded-full glass-panel text-sm font-medium text-blue-300 animate-fade-in-up">
            ✨ Introducing Smart Doctor AI 2.0
          </div>

          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-tight animate-fade-in">
            Your Health, <br />
            <span className="text-gradient-blue">Intelligent & Instant</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-16 leading-relaxed">
            Experience the future of healthcare. Describe your symptoms to our advanced AI
            and connect with world-class specialists in seconds.
          </p>

          <div id="symptom-analyzer" className="scroll-mt-28">
            <SymptomInput />
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-500">
            <span className="flex items-center gap-2 px-4 py-2 rounded-full glass-border">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Instant Analysis
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-full glass-border">
              <span className="text-blue-400">🛡️</span> HIPAA Compliant
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-full glass-border">
              <span className="text-purple-400">👨‍⚕️</span> Verified Doctors
            </span>
          </div>
        </div>
      </div>

      <FeaturedHospitals />

      {/* Stats / Trust Section */}
      <section className="py-20 border-y border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Users", value: "50k+" },
              { label: "Doctors Online", value: "1,200+" },
              { label: "Consultations", value: "100k+" },
              { label: "Accuracy Rate", value: "99.9%" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-blue-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div id="report-analyzer" className="scroll-mt-24">
        <MedicalReportAnalyzer />
      </div>

      <Testimonials />

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white">Ready to prioritize your health?</h2>
          <p className="text-xl text-gray-400 mb-10">Join thousands of users who trust SmartDoc for their healthcare needs.</p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/register" className="px-10 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all transform hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
