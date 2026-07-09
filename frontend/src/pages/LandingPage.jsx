import { ArrowRight, Clock3, MessageSquare, ShieldCheck, Video } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";

export default function LandingPage() {
    const [code, setCode] = useState("");
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const join = (event) => {
        event.preventDefault();
        const cleanCode = code.trim();
        if (cleanCode) navigate(`/meet/${encodeURIComponent(cleanCode)}`);
    };

    return (
        <main className="min-h-screen bg-canvas">
            <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold">
                    <span className="grid size-10 place-items-center rounded-md bg-brand-600 text-white"><Video size={21} /></span>
                    QuickMeet
                </Link>
                <Link to={isAuthenticated ? "/home" : "/auth"} className="btn-secondary">
                    {isAuthenticated ? "Dashboard" : "Sign in"}
                </Link>
            </header>

            <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-14 px-5 pb-16 pt-8 lg:grid-cols-[1.05fr_.95fr]">
                <div>
                    <p className="mb-4 text-sm font-semibold uppercase text-brand-700">Fast, focused video meetings</p>
                    <h1 className="max-w-2xl text-5xl font-bold leading-tight text-ink sm:text-6xl">
                        Meet face to face, wherever work happens.
                    </h1>
                    <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                        Start or join a browser-based video call with live chat, screen sharing, and a simple meeting history.
                    </p>
                    <div className="mt-9 flex flex-wrap gap-3">
                        <Link to={isAuthenticated ? "/home" : "/auth"} className="btn-primary">
                            Start a meeting <ArrowRight size={18} />
                        </Link>
                        <Link to="/meet/demo-room" className="btn-secondary">Join as guest</Link>
                    </div>
                    <div className="mt-12 grid max-w-xl gap-5 border-t border-slate-200 pt-7 sm:grid-cols-3">
                        <Feature icon={ShieldCheck} title="Private access" />
                        <Feature icon={MessageSquare} title="Room chat" />
                        <Feature icon={Clock3} title="Meeting history" />
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-lg bg-ink p-5 shadow-soft">
                    <div className="mb-5 flex items-center justify-between text-white">
                        <div>
                            <p className="text-xs text-slate-400">READY TO JOIN</p>
                            <p className="mt-1 font-semibold">Enter a meeting code</p>
                        </div>
                        <span className="size-2 rounded-full bg-emerald-400" />
                    </div>
                    <div className="aspect-video overflow-hidden rounded-md bg-slate-800">
                        <img src="/background.png" alt="QuickMeet video call" className="h-full w-full object-cover opacity-80" />
                    </div>
                    <form onSubmit={join} className="mt-5 flex gap-2">
                        <input value={code} onChange={(event) => setCode(event.target.value)} className="field border-slate-600 bg-slate-900 text-white placeholder:text-slate-500" placeholder="e.g. design-sync" aria-label="Meeting code" />
                        <button className="btn-primary shrink-0" disabled={!code.trim()}>Join</button>
                    </form>
                </div>
            </section>
        </main>
    );
}

function Feature({ icon: Icon, title }) {
    return <div className="flex items-center gap-2 text-sm font-medium text-slate-600"><Icon size={18} className="text-brand-600" />{title}</div>;
}
