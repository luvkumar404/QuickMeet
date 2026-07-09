import { Copy, LogOut, MessageSquare, Mic, MicOff, MonitorUp, Send, Video, VideoOff, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { API_URL } from "../lib/api.js";

const peerConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

export default function MeetingPage() {
    const { meetingCode } = useParams();
    const navigate = useNavigate();
    const localVideo = useRef(null);
    const localStream = useRef(null);
    const socket = useRef(null);
    const peers = useRef(new Map());
    const [name, setName] = useState("");
    const [joined, setJoined] = useState(false);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState("");
    const [remoteStreams, setRemoteStreams] = useState([]);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => () => {
        socket.current?.disconnect();
        peers.current.forEach((peer) => peer.close());
        localStream.current?.getTracks().forEach((track) => track.stop());
    }, []);

    useEffect(() => {
        if (joined && localVideo.current && localStream.current) {
            localVideo.current.srcObject = localStream.current;
        }
    }, [joined]);

    const createPeer = (id) => {
        if (peers.current.has(id)) return peers.current.get(id);
        const peer = new RTCPeerConnection(peerConfig);
        localStream.current?.getTracks().forEach((track) => peer.addTrack(track, localStream.current));
        peer.onicecandidate = ({ candidate }) => {
            if (candidate) socket.current?.emit("signal", id, JSON.stringify({ ice: candidate }));
        };
        peer.ontrack = ({ streams }) => {
            const stream = streams[0];
            setRemoteStreams((current) => current.some((item) => item.id === id)
                ? current.map((item) => item.id === id ? { id, stream } : item)
                : [...current, { id, stream }]);
        };
        peers.current.set(id, peer);
        return peer;
    };

    const handleSignal = async (fromId, rawMessage) => {
        try {
            const signal = JSON.parse(rawMessage);
            const peer = createPeer(fromId);
            if (signal.sdp) {
                await peer.setRemoteDescription(signal.sdp);
                if (signal.sdp.type === "offer") {
                    const answer = await peer.createAnswer();
                    await peer.setLocalDescription(answer);
                    socket.current.emit("signal", fromId, JSON.stringify({ sdp: peer.localDescription }));
                }
            }
            if (signal.ice) await peer.addIceCandidate(signal.ice);
        } catch {
            setError("A participant connection could not be established");
        }
    };

    const join = async (event) => {
        event.preventDefault();
        if (!name.trim()) return setError("Enter your display name");
        setJoining(true);
        setError("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStream.current = stream;
            if (localVideo.current) localVideo.current.srcObject = stream;

            const client = io(API_URL, { transports: ["websocket", "polling"] });
            socket.current = client;
            client.on("signal", handleSignal);
            client.on("room-error", setError);
            client.on("chat-message", (data, sender, senderId) => {
                setMessages((current) => [...current, { id: crypto.randomUUID(), data, sender, own: senderId === client.id }]);
            });
            client.on("user-left", (id) => {
                peers.current.get(id)?.close();
                peers.current.delete(id);
                setRemoteStreams((current) => current.filter((item) => item.id !== id));
            });
            client.on("user-joined", async (id, clients) => {
                for (const clientId of clients) {
                    if (clientId !== client.id) createPeer(clientId);
                }
                if (id === client.id) {
                    for (const [peerId, peer] of peers.current) {
                        const offer = await peer.createOffer();
                        await peer.setLocalDescription(offer);
                        client.emit("signal", peerId, JSON.stringify({ sdp: peer.localDescription }));
                    }
                }
            });
            client.on("connect", () => client.emit("join-call", meetingCode));
            client.on("connect_error", () => setError("Could not connect to the meeting server"));
            setJoined(true);
        } catch {
            setError("Camera and microphone access is required to join");
        } finally {
            setJoining(false);
        }
    };

    const toggleTrack = (kind, enabled, setter) => {
        localStream.current?.getTracks().filter((track) => track.kind === kind).forEach((track) => { track.enabled = !enabled; });
        setter(!enabled);
    };

    const shareScreen = async () => {
        try {
            const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = screen.getVideoTracks()[0];
            const cameraTrack = localStream.current?.getVideoTracks()[0];
            peers.current.forEach((peer) => peer.getSenders().find((sender) => sender.track?.kind === "video")?.replaceTrack(screenTrack));
            if (localVideo.current) localVideo.current.srcObject = screen;
            screenTrack.onended = () => {
                peers.current.forEach((peer) => peer.getSenders().find((sender) => sender.track?.kind === "video")?.replaceTrack(cameraTrack));
                if (localVideo.current) localVideo.current.srcObject = localStream.current;
            };
        } catch {
            // The browser also rejects when the user cancels the share picker.
        }
    };

    const leave = () => {
        socket.current?.disconnect();
        localStream.current?.getTracks().forEach((track) => track.stop());
        navigate("/");
    };

    const sendMessage = (event) => {
        event.preventDefault();
        if (!message.trim()) return;
        socket.current?.emit("chat-message", message, name);
        setMessage("");
    };

    if (!joined) {
        return (
            <main className="grid min-h-screen place-items-center bg-ink px-5 py-10 text-white">
                <div className="w-full max-w-lg">
                    <div className="mb-8 flex items-center justify-between">
                        <div><p className="text-sm text-slate-400">MEETING ROOM</p><h1 className="mt-1 text-2xl font-bold">{meetingCode}</h1></div>
                        <button onClick={() => navigator.clipboard.writeText(meetingCode)} className="grid size-10 place-items-center rounded-md bg-slate-800" title="Copy meeting code"><Copy size={18} /></button>
                    </div>
                    <div className="aspect-video overflow-hidden rounded-lg bg-slate-800">
                        <video ref={localVideo} autoPlay muted playsInline className="h-full w-full object-cover" />
                    </div>
                    <form onSubmit={join} className="mt-6">
                        <label className="text-sm font-medium text-slate-300">Display name</label>
                        <div className="mt-2 flex gap-2">
                            <input value={name} onChange={(event) => setName(event.target.value)} className="field border-slate-600 bg-slate-900 text-white" placeholder="Your name" maxLength={80} />
                            <button className="btn-primary shrink-0" disabled={joining}>{joining ? "Joining..." : "Join now"}</button>
                        </div>
                        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#101918] text-white">
            <header className="flex h-16 items-center justify-between border-b border-white/10 px-5">
                <div><span className="font-bold">QuickMeet</span><span className="ml-3 text-sm text-slate-400">{meetingCode}</span></div>
                <button onClick={() => navigator.clipboard.writeText(meetingCode)} className="text-slate-400 hover:text-white" title="Copy meeting code"><Copy size={18} /></button>
            </header>
            {error && <p className="absolute left-1/2 top-20 z-20 -translate-x-1/2 rounded-md bg-red-600 px-4 py-2 text-sm">{error}</p>}
            <section className={`grid min-h-[calc(100vh-8.5rem)] gap-3 p-3 ${remoteStreams.length ? "sm:grid-cols-2" : ""}`}>
                <VideoTile streamRef={localVideo} label={`${name} (You)`} muted />
                {remoteStreams.map((item, index) => <RemoteVideo key={item.id} stream={item.stream} label={`Participant ${index + 1}`} />)}
            </section>

            <div className="fixed bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-white/10 bg-slate-900 p-2 shadow-2xl">
                <Control icon={audioEnabled ? Mic : MicOff} label="Microphone" active={audioEnabled} onClick={() => toggleTrack("audio", audioEnabled, setAudioEnabled)} />
                <Control icon={videoEnabled ? Video : VideoOff} label="Camera" active={videoEnabled} onClick={() => toggleTrack("video", videoEnabled, setVideoEnabled)} />
                <Control icon={MonitorUp} label="Share screen" onClick={shareScreen} />
                <Control icon={MessageSquare} label="Chat" active={chatOpen} onClick={() => setChatOpen((value) => !value)} />
                <button onClick={leave} className="grid size-11 place-items-center rounded-md bg-red-600 hover:bg-red-700" title="Leave meeting"><LogOut size={19} /></button>
            </div>

            {chatOpen && (
                <aside className="fixed bottom-20 right-4 top-20 z-30 flex w-[min(360px,calc(100vw-2rem))] flex-col rounded-lg bg-white text-ink shadow-2xl">
                    <div className="flex h-14 items-center justify-between border-b px-4"><h2 className="font-bold">Room chat</h2><button onClick={() => setChatOpen(false)} title="Close chat"><X size={19} /></button></div>
                    <div className="flex-1 space-y-4 overflow-y-auto p-4">
                        {messages.length === 0 && <p className="text-center text-sm text-slate-400">No messages yet</p>}
                        {messages.map((item) => <div key={item.id}><p className="text-xs font-semibold text-brand-700">{item.own ? "You" : item.sender}</p><p className="mt-1 break-words text-sm">{item.data}</p></div>)}
                    </div>
                    <form onSubmit={sendMessage} className="flex gap-2 border-t p-3"><input className="field" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a message" maxLength={2000} /><button className="btn-primary px-3" title="Send"><Send size={18} /></button></form>
                </aside>
            )}
        </main>
    );
}

function VideoTile({ streamRef, label, muted }) {
    return <div className="relative min-h-64 overflow-hidden rounded-lg bg-slate-800"><video ref={streamRef} autoPlay playsInline muted={muted} className="h-full w-full object-cover" /><span className="absolute bottom-3 left-3 rounded bg-black/50 px-2 py-1 text-xs">{label}</span></div>;
}

function RemoteVideo({ stream, label }) {
    const ref = useRef(null);
    useEffect(() => { if (ref.current) ref.current.srcObject = stream; }, [stream]);
    return <VideoTile streamRef={ref} label={label} />;
}

function Control({ icon: Icon, label, active, onClick }) {
    return <button onClick={onClick} className={`grid size-11 place-items-center rounded-md ${active === false ? "bg-red-600" : active ? "bg-brand-600" : "bg-slate-700 hover:bg-slate-600"}`} title={label}><Icon size={19} /></button>;
}
