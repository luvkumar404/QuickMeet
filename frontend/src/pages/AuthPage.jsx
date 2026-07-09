import { LoaderCircle, Video } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { getApiError } from "../lib/api.js";

export default function AuthPage() {
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState({ name: "", username: "", password: "" });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { login, register, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (isAuthenticated) return <Navigate to="/home" replace />;

    const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    const submit = async (event) => {
        event.preventDefault();
        setError("");
        if (form.password.length < 8) return setError("Password must be at least 8 characters");
        if (form.username.trim().length < 3) return setError("Username must be at least 3 characters");
        if (mode === "register" && form.name.trim().length < 2) return setError("Please enter your full name");

        setSubmitting(true);
        try {
            if (mode === "login") await login({ username: form.username, password: form.password });
            else await register(form);
            navigate(location.state?.from?.pathname || "/home", { replace: true });
        } catch (requestError) {
            setError(getApiError(requestError, "Unable to authenticate"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="grid min-h-screen bg-white lg:grid-cols-2">
            <section className="flex items-center justify-center px-5 py-12">
                <div className="w-full max-w-md">
                    <Link to="/" className="mb-12 flex items-center gap-2 text-xl font-bold">
                        <span className="grid size-10 place-items-center rounded-md bg-brand-600 text-white"><Video size={21} /></span>
                        QuickMeet
                    </Link>
                    <h1 className="text-3xl font-bold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
                    <p className="mt-2 text-slate-500">{mode === "login" ? "Sign in to start and track meetings." : "Set up your profile in a few seconds."}</p>

                    <div className="mt-8 grid grid-cols-2 rounded-md bg-slate-100 p-1">
                        {["login", "register"].map((item) => (
                            <button key={item} onClick={() => { setMode(item); setError(""); }} className={`rounded px-3 py-2 text-sm font-semibold ${mode === item ? "bg-white shadow-sm" : "text-slate-500"}`}>
                                {item === "login" ? "Sign in" : "Register"}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={submit} className="mt-6 space-y-4">
                        {mode === "register" && <Field label="Full name" name="name" value={form.name} onChange={update} autoComplete="name" />}
                        <Field label="Username" name="username" value={form.username} onChange={update} autoComplete="username" />
                        <Field label="Password" name="password" type="password" value={form.password} onChange={update} autoComplete={mode === "login" ? "current-password" : "new-password"} />
                        {error && <p className="rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">{error}</p>}
                        <button className="btn-primary w-full" disabled={submitting}>
                            {submitting && <LoaderCircle size={18} className="animate-spin" />}
                            {mode === "login" ? "Sign in" : "Create account"}
                        </button>
                    </form>
                </div>
            </section>
            <section className="hidden items-end bg-ink p-14 text-white lg:flex">
                <div className="max-w-lg">
                    <p className="text-sm font-semibold text-emerald-300">QUICKMEET</p>
                    <h2 className="mt-4 text-4xl font-bold leading-tight">Clear conversations without the setup overhead.</h2>
                    <p className="mt-5 leading-7 text-slate-300">Create a room, share the code, and connect directly from the browser.</p>
                </div>
            </section>
        </main>
    );
}

function Field({ label, ...props }) {
    return <label className="block text-sm font-medium text-slate-700">{label}<input className="field mt-1.5" required {...props} /></label>;
}
