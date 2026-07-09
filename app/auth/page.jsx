
"use client"

import React, { useState, useEffect } from "react";
import { Mail, Lock, Shield, UserCheck, LogOut, ArrowRight, Eye, EyeOff, AlertCircle, RefreshCw } from "lucide-react";
import { secureFetch, setStoredTokens, clearTokens, getUserPayload } from "../utils/apiClient";
import { useRouter } from "next/navigation"; 

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter(); 

  // Form Fields State
  const [formData, setFormData] = useState({ email: "", password: "", role: "User" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setCurrentUser(getUserPayload());
    
    const handleEviction = () => {
      setCurrentUser(null);
      setApiResponse({ error: "Session expired. Force logout triggered." });
    };

    window.addEventListener("auth-expired", handleEviction);
    return () => window.removeEventListener("auth-expired", handleEviction);
  }, []);

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.email) tempErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = "Invalid email format";
    
    if (!formData.password) tempErrors.password = "Password is required";
    else if (formData.password.length < 6) tempErrors.password = "Password must be at least 6 characters";
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleAuthAction = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);
    setApiResponse(null);
    const endpoint = isLogin ? "login" : "register";

    try {
      const response = await fetch(`http://localhost:5000/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || `${endpoint} operation failed`);

      if (isLogin) {
        setStoredTokens(data.access_token, data.refresh_token);
        setCurrentUser(getUserPayload());
        setApiResponse({ success: "Login Successful! Token stored safely." });
      } else {
        setApiResponse({ success: "Registration Successful! Please switch to Login tab." });
        setIsLogin(true);
      }
    } catch (err) {
      setApiResponse({ error: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerTestApiCall = async () => {
    setApiResponse(null);
    try {
      const res = await secureFetch("http://localhost:5000/users");
      const data = await res.json();
      setApiResponse({ data });
    } catch (err) {
      setApiResponse({ error: "API connection failed" });
    }
  };

  const handleNavigate = () => {
   router.push("/components/addUser"); 
  };

return (
  <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-6 text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
    <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-12">
      
      {/* Left Interactive Form Pane */}
      <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
        {currentUser ? (
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium tracking-wide">
              <UserCheck className="w-3.5 h-3.5" /> Session Active
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Welcome Back, Admin Panel Operator</h2>
            
            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-2 text-sm">
              <p><span className="text-slate-400">Account ID:</span> <code className="text-amber-400 font-mono">{currentUser.sub}</code></p>
              <p><span className="text-slate-400">Identified Email:</span> <span className="text-white font-medium">{currentUser.email}</span></p>
              <p><span className="text-slate-400">Assigned Privilege:</span> <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold rounded text-xs uppercase tracking-wider">{currentUser.role}</span></p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button onClick={triggerTestApiCall} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] text-slate-950 font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-amber-500/10">
                <RefreshCw className="w-4 h-4" /> Trigger Secure API Fetch
              </button>
              <button onClick={handleNavigate} className="flex items-center gap-2 border border-slate-700 hover:bg-slate-800 hover:text-white active:scale-[0.98] font-medium py-3 px-5 rounded-xl transition-all text-slate-300">
                <LogOut className="w-4 h-4" /> Go to Dashboard 
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-white">{isLogin ? "Sign Into Dashboard" : "Register Control Node"}</h2>
              <p className="text-slate-400 text-sm">Testing ground for access token (<code className="text-amber-400">1m</code>) & refresh tokens (<code className="text-rose-400">7d</code>)</p>
            </div>

            {/* Functional Switch Tabs */}
            <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-xl">
              <button type="button" onClick={() => { setIsLogin(true); setApiResponse(null); }} className={`flex-1 text-center py-2.5 text-sm font-semibold rounded-lg transition-all ${isLogin ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}>Login Gateway</button>
              <button type="button" onClick={() => { setIsLogin(false); setApiResponse(null); }} className={`flex-1 text-center py-2.5 text-sm font-semibold rounded-lg transition-all ${!isLogin ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}>Create Schema Registry</button>
            </div>

            <form onSubmit={handleAuthAction} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
                  <input type="email" placeholder="jane1@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`w-full bg-slate-950 border ${errors.email ? "border-rose-500 focus:ring-rose-500/20" : "border-slate-800 focus:ring-amber-500/20 focus:border-amber-500"} rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-4 transition-all`} />
                </div>
                {errors.email && <p className="text-rose-400 text-xs flex items-center gap-1 mt-1.5"><AlertCircle className="w-3.5 h-3.5" /> {errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Account Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
                  <input type={showPassword ? "text" : "password"} placeholder="••••••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={`w-full bg-slate-950 border ${errors.password ? "border-rose-500 focus:ring-rose-500/20" : "border-slate-800 focus:ring-amber-500/20 focus:border-amber-500"} rounded-xl pl-12 pr-12 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-4 transition-all`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300 focus:outline-none">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-rose-400 text-xs flex items-center gap-1 mt-1.5"><AlertCircle className="w-3.5 h-3.5" /> {errors.password}</p>}
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Database Access Authorization Role</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
                    <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-4 focus:ring-amber-500/20 appearance-none transition-all">
                      <option value="User">Standard User Token</option>
                      <option value="Admin">Elevated Admin Token</option>
                      <option value="Manager">Manager Token</option>
                    </select>
                  </div>
                </div>
              )}

              <button type="submit" disabled={isProcessing} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.99] disabled:opacity-50 text-slate-950 font-bold py-3.5 px-4 rounded-xl transition-all shadow-xl shadow-amber-500/10 mt-2">
                {isProcessing ? "Executing Lifecycle Routine..." : isLogin ? "Authorize & Sign In" : "Register Node Record"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Right Output Validation Playground Monitor Console */}
      <div className="md:col-span-5 bg-slate-950/60 p-8 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col">
        <div className="mb-4 flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Live JSON Node Monitor</h3>
        </div>

        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-y-auto max-h-[360px] md:max-h-none shadow-inner">
          {apiResponse ? (
            <pre className={`whitespace-pre-wrap ${apiResponse.error ? "text-rose-400" : apiResponse.success ? "text-emerald-400" : "text-amber-400"}`}>
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          ) : (
            <span className="text-slate-600">// Standing by. Execute Login or fetch queries to track background token mutation pipelines.</span>
          )}
        </div>
      </div>

    </div>
  </div>
)
}
