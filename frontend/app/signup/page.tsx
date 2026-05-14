"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { UserPlus, Mail, Lock, Briefcase, GraduationCap } from "lucide-react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"recruiter" | "student">("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Signup failed");
      login(data.access_token, data.user);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white border rounded-3xl shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold">Create Account</h1>
        <p className="text-muted-foreground text-sm">Join JobBoard Pro today.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold flex items-center gap-2"><Mail className="h-4 w-4" /> Email</label>
          <input
            required
            type="email"
            className="w-full p-3 border rounded-xl focus:ring-2 ring-primary-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold flex items-center gap-2"><Lock className="h-4 w-4" /> Password</label>
          <input
            required
            type="password"
            className="w-full p-3 border rounded-xl focus:ring-2 ring-primary-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">I am a...</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${role === "student" ? "bg-primary-50 border-primary-500 text-primary-700 shadow-sm" : "hover:bg-slate-50"}`}
            >
              <GraduationCap className="h-6 w-6" />
              <span className="text-xs font-bold">Student</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("recruiter")}
              className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${role === "recruiter" ? "bg-primary-50 border-primary-500 text-primary-700 shadow-sm" : "hover:bg-slate-50"}`}
            >
              <Briefcase className="h-6 w-6" />
              <span className="text-xs font-bold">Recruiter</span>
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

        <button
          disabled={loading}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <UserPlus className="h-5 w-5" />
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="text-primary-600 font-bold hover:underline">Login</Link>
      </p>
    </div>
  );
}
