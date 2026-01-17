import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

export default function SettingsTab() {
    const { user, logout } = useAuth();
    const [newsAlerts, setNewsAlerts] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [step, setStep] = useState<'confirm' | 'otp'>('confirm');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendDeleteOtp = async () => {
        setIsLoading(true);
        try {
            await authService.sendDeleteOtp();
            setStep('otp');
        } catch (error) {
            console.error(error);
            alert("Failed to send OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsLoading(true);
        try {
            await authService.deleteAccount(otp);
            alert('Account deleted successfully');
            logout();
        } catch (error) {
            console.error(error);
            alert('Invalid OTP or Deletion Failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>

            {/* Notifications */}
            <div className="glass-card p-6 rounded-2xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white font-medium">News Alerts</p>
                        <p className="text-sm text-gray-400">Receive specific health news and updates.</p>
                    </div>
                    <button
                        onClick={() => setNewsAlerts(!newsAlerts)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${newsAlerts ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${newsAlerts ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="glass-card p-6 rounded-2xl border border-red-900/30 bg-red-900/5">
                <h3 className="text-lg font-semibold text-red-500 mb-4">Danger Zone</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white font-medium">Delete Account</p>
                        <p className="text-sm text-gray-400">Permanently remove your account and all data.</p>
                    </div>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600 hover:text-white transition-colors text-sm font-bold"
                    >
                        Delete Account
                    </button>
                </div>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-md p-8 rounded-3xl border border-white/10 relative">
                        <button
                            onClick={() => {
                                setShowDeleteModal(false);
                                setStep('confirm');
                                setOtp('');
                            }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>

                        {step === 'confirm' ? (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                                    ⚠️
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Are you sure?</h3>
                                <p className="text-gray-400 mb-6">
                                    This action cannot be undone. We need to verify your identity before proceeding.
                                </p>
                                <button
                                    onClick={handleSendDeleteOtp}
                                    disabled={isLoading}
                                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? 'Sending OTP...' : 'Send OTP & Proceed'}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-white mb-2">Enter OTP</h3>
                                <p className="text-gray-400 text-sm mb-6">
                                    We sent a code to your registered email.
                                </p>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-center text-white text-xl tracking-widest mb-6 focus:border-blue-500 outline-none"
                                    maxLength={6}
                                />
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={isLoading || otp.length < 6}
                                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors mb-3 disabled:opacity-50"
                                >
                                    {isLoading ? 'Deleting...' : 'Verify & Delete'}
                                </button>
                                <button
                                    onClick={() => setStep('confirm')}
                                    className="text-sm text-gray-400 hover:text-white"
                                >
                                    Back
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
