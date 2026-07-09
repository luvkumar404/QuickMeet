import { ArrowRight, Copy, Plus, Video } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { api, getApiError } from "../lib/api.js";

const makeCode = () => `quick-${crypto.randomUUID().slice(0, 8)}`;

export default function DashboardPage() {
    const [meetingCode, setMeetingCode] = useState("");
    const [error, setError] = useState("");
    const [joining, setJoining] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const joinMeeting = async (code) => {
        const cleanCode = code.trim();
        if (!/^[a-zA-Z0-9_-]{3,100}$/.test(cleanCode)) {
            return setError("Use 3-100 letters, numbers, hyphens, or underscores");
        }
        setJoining(true);
        setError("");
        try {
            await api.post("/users/add_to_activity", { meetingCode: cleanCode });
            navigate(`/meet/${encodeURIComponent(cleanCode)}`);
        } catch (requestError) {
            setError(getApiError(requestError, "Could not join the meeting"));
        } finally {
            setJoining(false);
        }
    };

    const createMeeting = () => {
        const code = makeCode();
        setMeetingCode(code);
        joinMeeting(code);
    };

    return (
        <div className="min-h-screen bg-canvas">
            <AppHeader />
            <main className="mx-auto max-w-6xl px-5 py-12">
                <p className="text-sm font-semibold text-brand-700">HELLO, {user?.name?.toUpperCase()}</p>
                <h1 className="mt-2 text-4xl font-bold">Where do you want to meet?</h1>
                <p className="mt-3 text-slate-500">Start a new room or enter a code shared with you.</p>

                <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
                    <section className="rounded-lg bg-ink p-7 text-white shadow-soft sm:p-10">
                        <span className="grid size-12 place-items-center rounded-md bg-brand-600"><Video size={24} /></span>
                        <h2 className="mt-8 text-2xl font-bold">Start an instant meeting</h2>
                        <p className="mt-2 max-w-md text-slate-300">Create a unique room and invite others with the meeting code.</p>
                        <button onClick={createMeeting} className="btn-primary mt-8" disabled={joining}>
                            <Plus size={18} /> New meeting
                        </button>
                    </section>

                    <section className="rounded-lg border border-slate-200 bg-white p-7 shadow-soft sm:p-8">
                        <h2 className="text-xl font-bold">Join with a code</h2>
                        <p className="mt-2 text-sm text-slate-500">Meeting codes are provided by the host.</p>
                        <form onSubmit={(event) => { event.preventDefault(); joinMeeting(meetingCode); }} className="mt-7">
                            <label className="text-sm font-medium">Meeting code</label>
                            <div className="mt-2 flex gap-2">
                                <input className="field" value={meetingCode} onChange={(event) => setMeetingCode(event.target.value)} placeholder="design-sync" />
                                <button className="btn-primary px-4" disabled={joining || !meetingCode.trim()} title="Join meeting"><ArrowRight size={19} /></button>
                            </div>
                            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
                        </form>
                        {meetingCode && <button onClick={() => navigator.clipboard.writeText(meetingCode)} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700"><Copy size={16} /> Copy code</button>}
                    </section>
                </div>
            </main>
        </div>
    );
}
