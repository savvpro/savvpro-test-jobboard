"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { LogIn, Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
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
        <h1 className="text-3xl font-extrabold">Welcome Back</h1>
        <p className="text-muted-foreground text-sm">Login to manage your profile.</p>
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

        {error && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

        <button
          disabled={loading}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <LogIn className="h-5 w-5" />
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account? <Link href="/signup" className="text-primary-600 font-bold hover:underline">Sign Up</Link>
      </p>
    </div>
  );
}
