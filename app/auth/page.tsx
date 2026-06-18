"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, ShieldCheck, Mail, Lock, User, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { useWorkspaceStore } from "@/lib/workspace-store";

type AuthMode = "signin" | "signup" | "otp";

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signUp, verifyOtp, otpSentToEmail } = useWorkspaceStore();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Automatically transition to OTP view if store has pending OTP email
  useEffect(() => {
    if (otpSentToEmail) {
      setMode("otp");
    }
  }, [otpSentToEmail]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const success = signIn(email, password);
      setLoading(false);
      if (success) {
        router.push("/workspace");
      } else {
        setError("Invalid email or password. Hint: Use asha@acme.com / password123");
      }
    }, 800);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      signUp(name, email);
      setLoading(false);
      setMode("otp");
      setOtp(["", "", "", "", "", ""]);
      setError("");
    }, 800);
  };

  const handleOtpChange = (value: string, index: number) => {
    // Only accept numeric entries
    if (value && isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only store single digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Shift focus on backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit verification code.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const success = verifyOtp(code);
      setLoading(false);
      if (success) {
        router.push("/workspace");
      } else {
        setError("Invalid verification code. Hint: Use the code 864114");
      }
    }, 800);
  };

  // Pre-fill helper functions for easy demo
  const prefillSignIn = () => {
    setEmail("asha@acme.com");
    setPassword("password123");
  };

  const prefillSignUp = () => {
    setName("Asha Singh");
    setEmail("asha@acme.com");
    setPassword("password123");
  };

  const prefillOtp = () => {
    const codeDigits = "864114".split("");
    setOtp(codeDigits);
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#f8f6f2] text-ink relative grain">
      <div className="absolute left-[8%] top-[12%] h-48 w-48 rounded-full bg-peach/30 blur-3xl" />
      <div className="absolute right-[8%] bottom-[12%] h-48 w-48 rounded-full bg-lavender/25 blur-3xl" />

      {/* Top Navbar */}
      <header className="h-[58px] flex items-center px-6 shrink-0 relative z-10">
        <Logo href="/" />
        <Link href="/" className="ml-auto text-[11px] font-semibold text-[#6f6c66] hover:text-ink transition-colors flex items-center gap-1.5">
          <ArrowLeft size={12} /> Back to home
        </Link>
      </header>

      {/* Centered Auth Card */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="window w-full max-w-[420px] bg-white shadow-2xl">
          <div className="window-bar">
            <span className="window-dot bg-[#f0a693]" />
            <span className="window-dot bg-[#e8cf8e]" />
            <span className="window-dot bg-[#9fc9a8]" />
            <span className="ml-3 text-[9px] font-bold uppercase tracking-wider text-[#89837a]">
              {mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Verify Email"}
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-1">
              <h1 className="text-[18px] font-semibold tracking-tight">
                {mode === "signin" && "Welcome back"}
                {mode === "signup" && "Create your account"}
                {mode === "otp" && "Enter verification code"}
              </h1>
              <p className="text-[10px] text-[#716c65]">
                {mode === "signin" && "Decisions, documented. Access your AI workspace."}
                {mode === "signup" && "Get started with auditable and replayed AI workflows."}
                {mode === "otp" && `We sent a security code to your registered email.`}
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50/70 p-3 flex items-start gap-2.5 text-[10px] text-red-800">
                <AlertCircle size={14} className="shrink-0 text-red-600 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Mode: Sign In */}
            {mode === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email-input" className="text-[10px] font-bold uppercase tracking-wider text-[#7c766e]">Email address</label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b857d]" />
                    <input 
                      id="email-input"
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 w-full rounded-xl border border-[#ded8d0] pl-10 pr-4 text-[11px] outline-none focus:border-ink transition-colors"
                      placeholder="asha@acme.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password-input" className="text-[10px] font-bold uppercase tracking-wider text-[#7c766e]">Password</label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b857d]" />
                    <input 
                      id="password-input"
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 w-full rounded-xl border border-[#ded8d0] pl-10 pr-4 text-[11px] outline-none focus:border-ink transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full btn-primary !h-10 mt-2 flex items-center justify-center gap-1.5"
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : "Sign in"}
                </button>

                <div className="text-center pt-2 border-t border-[#eee]">
                  <button 
                    type="button" 
                    onClick={prefillSignIn}
                    className="text-[9px] font-semibold text-[#8b7ca4] hover:underline"
                  >
                    Quick fill test credentials (asha@acme.com)
                  </button>
                </div>
              </form>
            )}

            {/* Mode: Sign Up */}
            {mode === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="name-input" className="text-[10px] font-bold uppercase tracking-wider text-[#7c766e]">Full Name</label>
                  <div className="relative">
                    <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b857d]" />
                    <input 
                      id="name-input"
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-10 w-full rounded-xl border border-[#ded8d0] pl-10 pr-4 text-[11px] outline-none focus:border-ink transition-colors"
                      placeholder="Asha Singh"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="signup-email" className="text-[10px] font-bold uppercase tracking-wider text-[#7c766e]">Email address</label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b857d]" />
                    <input 
                      id="signup-email"
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 w-full rounded-xl border border-[#ded8d0] pl-10 pr-4 text-[11px] outline-none focus:border-ink transition-colors"
                      placeholder="asha@acme.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="signup-password" className="text-[10px] font-bold uppercase tracking-wider text-[#7c766e]">Password</label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b857d]" />
                    <input 
                      id="signup-password"
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 w-full rounded-xl border border-[#ded8d0] pl-10 pr-4 text-[11px] outline-none focus:border-ink transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full btn-primary !h-10 mt-2 flex items-center justify-center gap-1.5"
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : "Request OTP Code"}
                </button>

                <div className="text-center pt-2 border-t border-[#eee]">
                  <button 
                    type="button" 
                    onClick={prefillSignUp}
                    className="text-[9px] font-semibold text-[#8b7ca4] hover:underline"
                  >
                    Quick fill sign up fields
                  </button>
                </div>
              </form>
            )}

            {/* Mode: OTP Verification */}
            {mode === "otp" && (
              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#7c766e] block text-center">
                    Enter 6-digit OTP code
                  </label>
                  
                  {/* 6 code inputs grid */}
                  <div className="flex justify-between items-center gap-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpRefs.current[idx] = el; }}
                        type="text"
                        maxLength={1}
                        pattern="\d*"
                        required
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        className="h-12 w-12 text-center rounded-xl border border-[#ded8d0] text-[16px] font-bold font-mono outline-none focus:border-[#8b7ca4] focus:ring-1 focus:ring-[#8b7ca4] bg-white transition-all text-ink shadow-[0_1px_2px_rgba(0,0,0,.02)]"
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-[#e4ded6] bg-[#fbfaf8] p-3 text-center space-y-1">
                  <p className="text-[8px] font-bold uppercase tracking-wider text-[#8b857d]">Verification Help</p>
                  <p className="text-[9px] text-[#6f6c66] leading-4">
                    Enter the code <strong className="font-mono text-ink">864114</strong> to complete your verification checklist.
                  </p>
                </div>

                <div className="space-y-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full btn-primary !h-10 flex items-center justify-center gap-1.5"
                  >
                    {loading ? <Loader2 size={13} className="animate-spin" /> : "Verify & Log in"}
                  </button>

                  <button 
                    type="button" 
                    onClick={prefillOtp}
                    className="w-full text-center py-1 text-[9px] font-semibold text-[#8b7ca4] hover:underline"
                  >
                    Quick fill OTP digits
                  </button>
                </div>
              </form>
            )}

            {/* Footer switcher */}
            <div className="text-center pt-2">
              {mode === "signin" && (
                <button 
                  onClick={() => { setMode("signup"); setError(""); }}
                  className="text-[10px] text-[#716c65] hover:text-ink font-semibold transition-colors"
                >
                  Don't have an account? <span className="text-ink underline">Create one</span>
                </button>
              )}
              {mode === "signup" && (
                <button 
                  onClick={() => { setMode("signin"); setError(""); }}
                  className="text-[10px] text-[#716c65] hover:text-ink font-semibold transition-colors"
                >
                  Already have an account? <span className="text-ink underline">Sign in</span>
                </button>
              )}
              {mode === "otp" && (
                <button 
                  type="button"
                  onClick={() => { setMode("signup"); setError(""); }}
                  className="text-[10px] text-[#716c65] hover:text-ink font-semibold transition-colors"
                >
                  Change email or registration details
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
