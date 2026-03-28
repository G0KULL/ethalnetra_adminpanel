import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", {
        username,
        password,
      });
      localStorage.setItem("token", res.data.access_token);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Login failed. Please check credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-primary-50 to-white">
      <div className="flex flex-col justify-center px-12 lg:px-24">
        <div className="max-w-md w-full mx-auto space-y-10 group">
          <div className="space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-primary-600 flex items-center justify-center shadow-xl shadow-primary-200 rotation animate-in zoom-in slide-in-from-top-4 duration-700">
              <Lock className="text-white" size={28} />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Welcome back!
            </h1>
            <p className="text-gray-500 font-medium text-lg">
              Sign in to manage your e-commerce ecosystem.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold border border-red-100 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-red-400 rounded-full" /> {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Username
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors"
                    size={20}
                  />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all text-gray-900 font-medium"
                    placeholder="admin"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors"
                    size={20}
                  />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all text-gray-900 font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:shadow-2xl hover:shadow-primary-200 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={22} />{" "}
                  Authenticating...
                </>
              ) : (
                <>
                  Enter Dashboard <ArrowRight size={22} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm font-medium">
            Problems logging in? Please contact the superadmin.
          </p>
        </div>
      </div>

      <div className="hidden lg:block relative overflow-hidden bg-primary-600">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/40 via-transparent to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3"
          alt="Dashboard mockup"
          className="h-full w-full object-cover scale-110 blur-[1px] opacity-40"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center space-y-8 w-full px-12">
          <div className="space-y-4">
            <h2 className="text-5xl font-black text-white leading-tight">
              Fast. Robust. Reliable.
            </h2>
            <p className="text-primary-100 text-xl font-medium max-w-lg mx-auto leading-relaxed">
              The ultimate control center for the Ethalnethra e-commerce
              experience.
            </p>
          </div>
          <div className="flex items-center justify-center gap-6">
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 text-white w-40">
              <h3 className="text-3xl font-black">20x</h3>
              <p className="text-primary-200 text-sm font-bold uppercase mt-1 tracking-tighter">
                Faster UI
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 text-white w-40">
              <h3 className="text-3xl font-black">99.9%</h3>
              <p className="text-primary-200 text-sm font-bold uppercase mt-1 tracking-tighter">
                Reliability
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
