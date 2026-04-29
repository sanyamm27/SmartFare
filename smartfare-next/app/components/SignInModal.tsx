"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export default function SignInModal({
  onClose,
  onLogin,
}: {
  onClose: () => void;
  onLogin: (user: any) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);

  // Login States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => setMounted(true), []);

  const showToast = (message: string, type: "error" | "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLoginSubmit = async () => {
    if (!loginEmail || !loginPassword) return showToast("Please enter your email and password", "error");
    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      onLogin(result.user);
    } catch (e: any) {
      const msg =
        e.code === "auth/invalid-credential"
          ? "Incorrect email or password."
          : e.code === "auth/user-not-found"
          ? "No account found. Please Sign Up."
          : "Login failed. Please try again.";
      showToast(msg, "error");
    }
    setIsLoading(false);
  };

  const handleSignupSubmit = async () => {
    if (!name || !email || !password) return showToast("Please fill all fields", "error");
    if (password.length < 6) return showToast("Password must be at least 6 characters", "error");
    setIsLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      showToast("Account created!", "success");
      setTimeout(() => onLogin(result.user), 800);
    } catch (e: any) {
      const msg =
        e.code === "auth/email-already-in-use"
          ? "An account with this email already exists."
          : e.code === "auth/invalid-email"
          ? "Please enter a valid email address."
          : "Registration failed. Please try again.";
      showToast(msg, "error");
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLogin(result.user);
    } catch (e: any) {
      showToast("Google sign-in failed. Please try again.", "error");
    }
    setIsLoading(false);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-[440px] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Toast Notification */}
        <div className={`absolute top-0 left-0 w-full transition-all duration-300 z-50 ${toast ? "translate-y-0" : "-translate-y-full"}`}>
          <div className={`p-4 text-center text-sm font-bold text-white shadow-md ${toast?.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
            {toast?.message}
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors z-40"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              {isSignUp ? "Create an Account" : "Welcome Back"}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              {isSignUp
                ? "Sign up to track your travels seamlessly."
                : "Log in to manage your bookings and access exclusive deals."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!isSignUp ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-xl font-bold text-slate-700 transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Or Login With</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium text-sm"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium text-sm"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLoginSubmit()}
                  />
                  <button
                    onClick={handleLoginSubmit}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-70"
                  >
                    {isLoading ? "Signing in..." : "Continue"}
                  </button>
                </div>

                <p className="text-center text-sm text-slate-600 mt-6 font-medium">
                  Don&apos;t have an account?{" "}
                  <button onClick={() => setIsSignUp(true)} className="text-indigo-600 font-bold hover:underline">
                    Sign Up
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSignupSubmit()}
                />

                <button
                  onClick={handleSignupSubmit}
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-70"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>

                <p className="text-center text-sm text-slate-600 mt-6 font-medium">
                  Already have an account?{" "}
                  <button onClick={() => setIsSignUp(false)} className="text-indigo-600 font-bold hover:underline">
                    Log In
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-[10px] text-center text-slate-400 mt-8 leading-relaxed uppercase tracking-wider">
            By proceeding, you agree to SmartFare&apos;s <br />
            <a href="#" className="font-bold text-slate-500 hover:text-indigo-600">Privacy Policy</a> and{" "}
            <a href="#" className="font-bold text-slate-500 hover:text-indigo-600">Terms of Service</a>.
          </p>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
