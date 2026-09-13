import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Phone, KeyRound, UtensilsCrossed, AlertCircle, Eye, EyeOff, User } from 'lucide-react';
import { User as UserType } from '../types';
import { DEFAULT_USERS } from '../data/initialData';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: UserType) => void;
  lang: 'en' | 'hi';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onLoginSuccess,
  lang,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Login Method
  const [loginMethod, setLoginMethod] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [loginOtpState, setLoginOtpState] = useState<'IDLE' | 'SENT'>('IDLE');
  
  // Forgot Password States
  const [forgotPasswordMode, setForgotPasswordMode] = useState<false | 'REQUEST' | 'OTP' | 'NEW_PASS'>(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedId = identifier.trim();
    const trimmedPass = password.trim();

    if (!trimmedId || !trimmedPass) {
      setErrorMsg(
        lang === 'hi'
          ? 'कृपया ईमेल/फोन और पासवर्ड दोनों भरें।'
          : 'Please fill both email/phone and password fields.'
      );
      return;
    }

    const matched = DEFAULT_USERS.find(
      (u) => u.username.toLowerCase() === trimmedId.toLowerCase() && u.password === trimmedPass
    );

    if (matched) {
      onLoginSuccess({
        id: matched.id,
        username: matched.username,
        role: matched.role,
      });
    } else {
      setErrorMsg(
        lang === 'hi'
          ? 'अमान्य क्रेडेंशियल्स! कृपया पुनः प्रयास करें (उदा: admin / 123)'
          : 'Access Denied: Invalid Email/Phone or Password. (e.g., admin / 123)'
      );
    }
  };

  const handleQuickLogin = (role: string) => {
    const user = DEFAULT_USERS.find((u) => u.role === role);
    if (user) {
      onLoginSuccess({
        id: user.id,
        username: user.username,
        role: user.role,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#fdf9f1] rounded-3xl shadow-2xl border border-[#e5d8c5] overflow-hidden">
        {/* Header matching Ram Tara theme */}
        <div className="bg-[#b14c33] text-white p-8 text-center relative rounded-b-[2.5rem] shadow-md">
          <h1 className="text-3xl font-serif tracking-wider mb-1">RAM TARA</h1>
          <p className="text-[10px] tracking-[0.3em] uppercase text-amber-100 font-medium opacity-90 mb-4">
            Restaurant
          </p>
          <p className="text-xs text-amber-50 font-medium">
            {lang === 'hi' ? 'सुरक्षित रेस्तरां ईआरपी व बिलिंग लॉगिन' : 'Secure ERP & POS Login'}
          </p>
        </div>

        {/* Form Body */}
        {forgotPasswordMode === false ? (
          <form onSubmit={(e) => {
            e.preventDefault();
            if (loginMethod === 'OTP' && loginOtpState === 'IDLE') {
              // Handle Send OTP for Login
              if (!identifier.trim()) {
                setErrorMsg(lang === 'hi' ? 'कृपया अपना ईमेल या फ़ोन नंबर दर्ज करें।' : 'Please enter your email or phone number.');
                return;
              }
              const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
              setGeneratedOtp(newOtp);
              setErrorMsg(null);
              setSuccessMsg((lang === 'hi' ? 'OTP भेजा गया: ' : 'OTP Sent: ') + newOtp + ' (Demo)');
              setLoginOtpState('SENT');
              return;
            }
            if (loginMethod === 'OTP' && loginOtpState === 'SENT') {
              if (password !== generatedOtp) {
                setErrorMsg(lang === 'hi' ? 'ग़लत OTP, कृपया पुनः प्रयास करें।' : 'Invalid OTP, please try again.');
                return;
              }
              // OTP Matched, let's login (simulate finding user, we will just pass pass as is and let parent handle, or bypass parent password check)
              // Since parent handles login matching exactly, we will find the user here and bypass if it's OTP.
              // Actually, since we don't have user list in modal, let's just log them in as staff or manager if OTP matches.
              // Or better, let's let the parent handle the submit, but we just override the password field with the correct one if we had real auth.
              // For demo, we just call handleSubmit directly. We will assume the user entered any phone, we will mock a successful login.
              if (identifier.includes('7599') || identifier.includes('admin')) { handleQuickLogin('Admin'); } else { handleQuickLogin('Cashier'); }
              return;
            }
            handleSubmit(e);
          }} className="p-6 pt-4 space-y-5">
            
            {/* Login Method Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-lg mb-4">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('PASSWORD');
                  setLoginOtpState('IDLE');
                  setPassword('');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${loginMethod === 'PASSWORD' ? 'bg-white shadow-sm text-[#b14c33]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {lang === 'hi' ? 'पासवर्ड से लॉगिन' : 'Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('OTP');
                  setPassword('');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${loginMethod === 'OTP' ? 'bg-white shadow-sm text-[#b14c33]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {lang === 'hi' ? 'OTP से लॉगिन' : 'OTP Login'}
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <AlertCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-[#5c3a21] mb-1.5 ml-1">
                {lang === 'hi' ? 'ईमेल या फ़ोन नंबर' : 'Email or Phone Number'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8c674e] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-username-input"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@ramtara.com or 9876543210"
                  disabled={loginMethod === 'OTP' && loginOtpState === 'SENT'}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-[#e5d8c5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b14c33] focus:border-transparent text-[#3e2723] placeholder-[#bcaaa4] transition shadow-sm disabled:opacity-60"
                />
              </div>
            </div>
            
            {loginMethod === 'PASSWORD' && (
              <div>
                <label className="block text-xs font-semibold text-[#5c3a21] mb-1.5 ml-1">
                  {lang === 'hi' ? 'पासवर्ड (Password)' : 'Password'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#8c674e] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 text-sm bg-white border border-[#e5d8c5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b14c33] focus:border-transparent text-[#3e2723] placeholder-[#bcaaa4] transition shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8c674e] hover:text-[#b14c33] transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setForgotPasswordMode('REQUEST');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs font-semibold text-[#b14c33] hover:text-[#8a3824] transition-colors"
                  >
                    {lang === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                  </button>
                </div>
              </div>
            )}

            {loginMethod === 'OTP' && loginOtpState === 'SENT' && (
              <div className="animate-fade-in">
                <label className="block text-xs font-semibold text-[#5c3a21] mb-1.5 ml-1">
                  {lang === 'hi' ? 'OTP दर्ज करें' : 'Enter OTP'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#8c674e] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={password} // Using password state to store OTP temporarily
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="1234"
                    maxLength={4}
                    className="w-full pl-10 pr-4 py-3 text-center tracking-[0.5em] font-bold text-xl bg-white border border-[#e5d8c5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b14c33] text-[#3e2723] shadow-sm"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
                      setGeneratedOtp(newOtp);
                      setSuccessMsg((lang === 'hi' ? 'नया OTP भेजा गया: ' : 'New OTP Sent: ') + newOtp + ' (Demo)');
                    }}
                    className="text-xs font-semibold text-[#b14c33] hover:text-[#8a3824] transition-colors"
                  >
                    {lang === 'hi' ? 'फिर से OTP भेजें' : 'Resend OTP'}
                  </button>
                </div>
              </div>
            )}

            <button
              id="btn-login-submit"
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#b14c33] hover:bg-[#8a3824] text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 mt-2"
            >
              {loginMethod === 'OTP' && loginOtpState === 'IDLE' ? (
                <>
                  <Phone className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'OTP भेजें' : 'Send OTP'}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'लॉगिन करें' : 'Sign In'}</span>
                </>
              )}
            </button>
            
            <div className="pt-5 border-t border-[#e5d8c5] mt-6">
              <p className="text-[10px] font-semibold text-[#8c674e] uppercase tracking-wider text-center mb-3">
                {lang === 'hi' ? 'त्वरित डेमो क्रेडेंशियल्स' : 'Demo Instant Access'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="quick-admin-btn"
                  onClick={() => handleQuickLogin('Admin')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-amber-200/60 bg-white hover:bg-amber-50 transition text-left group text-[#5c3a21] shadow-sm"
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs group-hover:text-[#b14c33] transition-colors">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Admin</span>
                  </div>
                  <span className="text-[10px] text-[#8c674e] font-mono mt-1 group-hover:text-[#5c3a21] transition-colors text-center leading-tight">7599791753<br/>ankur7755</span>
                </button>
                <button
                  type="button"
                  id="quick-cashier-btn"
                  onClick={() => handleQuickLogin('Cashier')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-amber-200/60 bg-white hover:bg-amber-50 transition text-left group text-[#5c3a21] shadow-sm"
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs group-hover:text-[#b14c33] transition-colors">
                    <User className="w-4 h-4 text-amber-600" />
                    <span>Cashier</span>
                  </div>
                  <span className="text-[10px] text-[#8c674e] font-mono mt-1 group-hover:text-[#5c3a21] transition-colors">cashier123</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-6 pt-8 space-y-5">
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                <AlertCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}
            
            {forgotPasswordMode === 'REQUEST' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#5c3a21] text-center">
                  {lang === 'hi' ? 'पासवर्ड रीसेट करें' : 'Reset Password'}
                </h3>
                <p className="text-xs text-[#8c674e] text-center mb-4">
                  {lang === 'hi' ? 'अपना रजिस्टर्ड मोबाइल नंबर या ईमेल दर्ज करें। हम आपको OTP भेजेंगे।' : 'Enter your registered mobile number or email. We will send an OTP.'}
                </p>
                <div>
                  <label className="block text-xs font-semibold text-[#5c3a21] mb-1.5 ml-1">
                    {lang === 'hi' ? 'ईमेल या फ़ोन नंबर' : 'Email or Phone Number'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#8c674e] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-[#e5d8c5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b14c33] text-[#3e2723] shadow-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!resetIdentifier.trim()) {
                      setErrorMsg(lang === 'hi' ? 'कृपया अपना ईमेल या फ़ोन नंबर दर्ज करें।' : 'Please enter your email or phone number.');
                      return;
                    }
                    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
                    setGeneratedOtp(newOtp);
                    setErrorMsg(null);
                    setSuccessMsg((lang === 'hi' ? 'OTP भेजा गया: ' : 'OTP Sent: ') + newOtp + ' (Demo)');
                    setForgotPasswordMode('OTP');
                  }}
                  className="w-full py-3 rounded-xl bg-[#b14c33] hover:bg-[#8a3824] text-white font-bold text-sm shadow-md transition"
                >
                  {lang === 'hi' ? 'OTP भेजें' : 'Send OTP'}
                </button>
              </div>
            )}

            {forgotPasswordMode === 'OTP' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#5c3a21] text-center">
                  {lang === 'hi' ? 'OTP दर्ज करें' : 'Enter OTP'}
                </h3>
                <p className="text-xs text-[#8c674e] text-center mb-4">
                  {lang === 'hi' ? 'आपके नंबर पर भेजा गया 4 अंकों का OTP दर्ज करें।' : 'Enter the 4-digit OTP sent to your number.'}
                </p>
                <div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#8c674e] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="e.g. 1234"
                      maxLength={4}
                      className="w-full pl-10 pr-4 py-3 text-center tracking-[0.5em] font-bold text-xl bg-white border border-[#e5d8c5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b14c33] text-[#3e2723] shadow-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (otp !== generatedOtp) {
                      setErrorMsg(lang === 'hi' ? 'ग़लत OTP, कृपया पुनः प्रयास करें।' : 'Invalid OTP, please try again.');
                      return;
                    }
                    setErrorMsg(null);
                    setSuccessMsg(lang === 'hi' ? 'OTP सत्यापित हो गया है। नया पासवर्ड बनाएं।' : 'OTP Verified successfully. Create new password.');
                    setForgotPasswordMode('NEW_PASS');
                  }}
                  className="w-full py-3 rounded-xl bg-[#b14c33] hover:bg-[#8a3824] text-white font-bold text-sm shadow-md transition"
                >
                  {lang === 'hi' ? 'OTP सत्यापित करें' : 'Verify OTP'}
                </button>
              </div>
            )}

            {forgotPasswordMode === 'NEW_PASS' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#5c3a21] text-center">
                  {lang === 'hi' ? 'नया पासवर्ड' : 'New Password'}
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-[#5c3a21] mb-1.5 ml-1">
                    {lang === 'hi' ? 'नया पासवर्ड दर्ज करें' : 'Enter New Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8c674e] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-[#e5d8c5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b14c33] text-[#3e2723] shadow-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (newPassword.length < 4) {
                      setErrorMsg(lang === 'hi' ? 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' : 'Password must be at least 4 characters.');
                      return;
                    }
                    // Simulate setting password
                    setErrorMsg(null);
                    setSuccessMsg(lang === 'hi' ? 'पासवर्ड सफलतापूर्वक बदल दिया गया है!' : 'Password reset successfully!');
                    setTimeout(() => {
                      setForgotPasswordMode(false);
                      setSuccessMsg(null);
                      setIdentifier(resetIdentifier);
                      setPassword(newPassword);
                    }, 1500);
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
                >
                  {lang === 'hi' ? 'पासवर्ड बदलें' : 'Reset Password'}
                </button>
              </div>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setForgotPasswordMode(false);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs font-semibold text-[#8c674e] hover:text-[#5c3a21] transition-colors"
              >
                {lang === 'hi' ? 'लॉगिन पेज पर वापस जाएं' : 'Back to Login'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

