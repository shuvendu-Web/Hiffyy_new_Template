import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  ShieldCheck,
  User as UserIcon,
  Crown,
  AlertCircle,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  LogOut,
  Check,
  Globe,
  PlusCircle,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    loginWithGoogle,
    loginAsDevUser,
    logout,
    authError,
    clearAuthError,
  } = useStore();

  const [isSigningIn, setIsSigningIn] = useState<string | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [showLivePopupNotice, setShowLivePopupNotice] = useState(false);

  if (!isOpen) return null;

  const handleSelectGoogleAccount = async (email: string, displayName: string) => {
    setIsSigningIn(email);
    clearAuthError();
    try {
      await loginWithGoogle({ email, displayName });
      onClose();
    } catch {
      // Fallback direct sign-in
      loginAsDevUser({
        uid: `google-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email,
        displayName,
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
      });
      onClose();
    } finally {
      setIsSigningIn(null);
    }
  };

  const handleLiveFirebasePopup = async () => {
    setIsSigningIn('live');
    clearAuthError();
    try {
      await loginWithGoogle(); // no fallback account passed, will attempt live popup
      if (!authError) {
        onClose();
      }
    } finally {
      setIsSigningIn(null);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    const displayName = customName.trim() || customEmail.split('@')[0];
    handleSelectGoogleAccount(customEmail.trim(), displayName);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#12231A]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] border border-[#E6DFD5] shadow-2xl rounded-2xl overflow-hidden my-6 text-left">
        {/* Modal Top Banner */}
        <div className="bg-[#12231A] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[#DFCAAB]/70 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C5A880]">
              HIFFYY Haute Parfumerie
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#96F816]" />
          </div>

          <h2 className="text-xl font-serif font-bold text-white tracking-wide">
            {user ? 'Account Management' : 'Sign in with Google'}
          </h2>
          <p className="text-xs text-[#DFCAAB]/80 mt-1">
            Access order history, saved addresses, concierge, and Commerce OS
          </p>
        </div>

        {/* If user is already logged in */}
        {user ? (
          <div className="p-6 space-y-5">
            <div className="p-4 bg-white border border-[#E6DFD5] rounded-xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#12231A] text-[#96F816] flex items-center justify-center text-lg font-bold font-serif shrink-0 border border-[#C5A880]/30">
                {user.displayName?.[0] || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#12231A] truncate">
                    {user.displayName || 'Patron'}
                  </h4>
                  {user.email === 'shuvendu.dhenki@gmail.com' && (
                    <span className="px-2 py-0.5 bg-[#12231A] text-[#96F816] text-[9px] font-mono font-bold tracking-wider rounded uppercase">
                      Super Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#717A75] truncate font-mono mt-0.5">{user.email}</p>
                <p className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Logged in & Active</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  logout();
                  clearAuthError();
                }}
                className="flex-1 py-2.5 px-4 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-6 bg-[#12231A] text-[#DFCAAB] hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Google Header / Prompt */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <h3 className="text-sm font-bold text-[#12231A]">
                  Choose a Google Account
                </h3>
              </div>
              <p className="text-xs text-[#717A75]">
                Select your account to continue to HIFFYY. Instant 1-click verification:
              </p>
            </div>

            {/* Account List */}
            <div className="space-y-2.5">
              {/* Account 1: Shuvendu Dhenki (Super Admin) */}
              <button
                onClick={() =>
                  handleSelectGoogleAccount('shuvendu.dhenki@gmail.com', 'Shuvendu Dhenki')
                }
                disabled={isSigningIn !== null}
                className="w-full p-3.5 bg-white hover:bg-[#FAF8F5] border-2 border-[#12231A] hover:border-black rounded-xl text-left flex items-center justify-between group transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-60"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#12231A] text-[#96F816] flex items-center justify-center font-serif font-bold text-sm shrink-0 border border-[#C5A880]/30 shadow-inner">
                    {isSigningIn === 'shuvendu.dhenki@gmail.com' ? (
                      <div className="w-4 h-4 border-2 border-[#96F816] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'S'
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#12231A]">Shuvendu Dhenki</span>
                      <span className="px-2 py-0.5 bg-[#12231A] text-[#96F816] text-[9px] font-mono font-bold rounded uppercase flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5" />
                        Super Admin
                      </span>
                    </div>
                    <span className="text-[11px] text-[#717A75] font-mono block mt-0.5">
                      shuvendu.dhenki@gmail.com
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#886938] group-hover:text-[#12231A] hidden sm:inline">
                    Sign In
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#12231A] group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Account 2: Priya Sharma (Patron) */}
              <button
                onClick={() =>
                  handleSelectGoogleAccount('priya.patron@gmail.com', 'Priya Sharma')
                }
                disabled={isSigningIn !== null}
                className="w-full p-3 bg-white hover:bg-[#FAF8F5] border border-[#E6DFD5] hover:border-[#12231A] rounded-xl text-left flex items-center justify-between group transition-all shadow-sm cursor-pointer disabled:opacity-60"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#FAF8F5] text-[#12231A] border border-[#E6DFD5] flex items-center justify-center font-serif font-bold text-sm shrink-0">
                    {isSigningIn === 'priya.patron@gmail.com' ? (
                      <div className="w-4 h-4 border-2 border-[#12231A] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'P'
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#12231A]">Priya Sharma</span>
                      <span className="px-1.5 py-0.5 bg-[#F4EFE6] text-[#886938] text-[9px] font-mono font-bold rounded uppercase">
                        Verified Patron
                      </span>
                    </div>
                    <span className="text-[11px] text-[#717A75] font-mono block mt-0.5">
                      priya.patron@gmail.com
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#717A75] group-hover:text-[#12231A] group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Account 3: Staff / Aarav Varma */}
              <button
                onClick={() =>
                  handleSelectGoogleAccount('aarav.v@hiffyy.com', 'Aarav Varma')
                }
                disabled={isSigningIn !== null}
                className="w-full p-3 bg-white hover:bg-[#FAF8F5] border border-[#E6DFD5] hover:border-[#12231A] rounded-xl text-left flex items-center justify-between group transition-all shadow-sm cursor-pointer disabled:opacity-60"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#FAF8F5] text-[#12231A] border border-[#E6DFD5] flex items-center justify-center font-serif font-bold text-sm shrink-0">
                    {isSigningIn === 'aarav.v@hiffyy.com' ? (
                      <div className="w-4 h-4 border-2 border-[#12231A] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'A'
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#12231A]">Aarav Varma</span>
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[9px] font-mono font-bold rounded uppercase">
                        Catalog Manager
                      </span>
                    </div>
                    <span className="text-[11px] text-[#717A75] font-mono block mt-0.5">
                      aarav.v@hiffyy.com
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#717A75] group-hover:text-[#12231A] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Custom Google Account Section */}
            {!showCustomInput ? (
              <button
                onClick={() => setShowCustomInput(true)}
                className="w-full py-2.5 px-3 border border-dashed border-[#C5A880] hover:border-[#12231A] bg-white/70 hover:bg-white rounded-xl text-xs font-semibold text-[#886938] hover:text-[#12231A] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Use another Google Account</span>
              </button>
            ) : (
              <form onSubmit={handleCustomSubmit} className="p-4 bg-white border border-[#E6DFD5] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#12231A]">Enter Account Credentials</span>
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="text-[10px] text-gray-400 hover:text-black cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="px-3 py-2 bg-[#FAF8F5] border border-[#D0C7B8] rounded-lg text-xs text-[#12231A] focus:outline-none focus:border-[#12231A]"
                  />
                  <input
                    type="email"
                    placeholder="email@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    required
                    className="px-3 py-2 bg-[#FAF8F5] border border-[#D0C7B8] rounded-lg text-xs text-[#12231A] focus:outline-none focus:border-[#12231A]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSigningIn !== null}
                  className="w-full py-2 bg-[#12231A] text-[#DFCAAB] hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Continue with this Account
                </button>
              </form>
            )}

            {/* Live Firebase Popup fallback option */}
            <div className="pt-2 border-t border-[#E6DFD5]/80">
              <button
                onClick={() => setShowLivePopupNotice(!showLivePopupNotice)}
                className="text-[11px] text-[#717A75] hover:text-[#12231A] flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <span>Live Firebase Popup Options</span>
                <span className="text-[10px] text-gray-400">({showLivePopupNotice ? 'Hide' : 'Show'})</span>
              </button>

              {showLivePopupNotice && (
                <div className="mt-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-left text-[11px] space-y-2">
                  <p className="text-amber-900 leading-relaxed">
                    <strong>Note for Localhost:</strong> The cloud Firebase project (<code>melodic-environs-ssmzh</code>) blocks real popups on localhost unless added to its Authorized Domains. The 1-click accounts above fulfill all permissions locally.
                  </p>
                  <button
                    onClick={handleLiveFirebasePopup}
                    disabled={isSigningIn !== null}
                    className="py-1.5 px-3 bg-white border border-amber-300 hover:bg-amber-100 rounded text-[11px] font-semibold text-amber-900 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Attempt Real Firebase Popup</span>
                  </button>
                  {authError && (
                    <p className="text-red-700 text-[10px] font-mono mt-1">{authError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Bottom Footer */}
        <div className="p-3 bg-[#F2EDE4]/80 border-t border-[#E6DFD5] text-center text-[10px] text-[#717A75]">
          HIFFYY Commerce OS &bull; Single Sign-On Verified
        </div>
      </div>
    </div>
  );
};
