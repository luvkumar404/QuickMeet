import { ArrowLeft, CalendarDays, LoaderCircle, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader.jsx";
import { api, getApiError } from "../lib/api.js";

export default function HistoryPage() {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/users/get_all_activity")
            .then(({ data }) => setMeetings(data.data.meetings))
            .catch((requestError) => setError(getApiError(requestError, "Could not load meeting history")))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-canvas">
            <AppHeader />
            <main className="mx-auto max-w-5xl px-5 py-10">
                <Link to="/home" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft size={17} /> Back to dashboard</Link>
                <h1 className="mt-7 text-3xl font-bold">Meeting history</h1>
                <p className="mt-2 text-slate-500">Your recently joined rooms, newest first.</p>

                {loading && <div className="mt-16 flex justify-center"><LoaderCircle className="animate-spin text-brand-600" /></div>}
                {error && <p className="mt-8 rounded-md bg-red-50 p-4 text-red-700">{error}</p>}
                {!loading && !error && meetings.length === 0 && (
                    <div className="mt-10 border border-dashed border-slate-300 bg-white p-10 text-center">
                        <CalendarDays className="mx-auto text-slate-400" />
                        <p className="mt-3 font-semibold">No meetings yet</p>
                        <p className="mt-1 text-sm text-slate-500">Meetings you join will appear here.</p>
                    </div>
                )}
                <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
                    {meetings.map((meeting) => (
                        <div key={meeting._id} className="flex flex-wrap items-center justify-between gap-4 bg-white px-5 py-5">
                            <div className="flex items-center gap-4">
                                <span className="grid size-10 place-items-center rounded-md bg-brand-50 text-brand-700"><Video size={19} /></span>
                                <div><p className="font-semibold">{meeting.meetingCode}</p><p className="mt-1 text-sm text-slate-500">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(meeting.date))}</p></div>
                            </div>
                            <button onClick={() => navigate(`/meet/${encodeURIComponent(meeting.meetingCode)}`)} className="btn-secondary">Rejoin</button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
