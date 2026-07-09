import { History, LogOut, Video } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function AppHeader() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
                <Link to="/home" className="flex items-center gap-2 text-lg font-bold">
                    <span className="grid size-9 place-items-center rounded-md bg-brand-600 text-white"><Video size={19} /></span>
                    QuickMeet
                </Link>
                <nav className="flex items-center gap-2">
                    <span className="hidden text-sm text-slate-500 sm:block">{user?.name}</span>
                    <Link to="/history" className="grid size-10 place-items-center rounded-md text-slate-600 hover:bg-slate-100" title="Meeting history">
                        <History size={20} />
                    </Link>
                    <button onClick={handleLogout} className="grid size-10 place-items-center rounded-md text-slate-600 hover:bg-slate-100" title="Log out">
                        <LogOut size={20} />
                    </button>
                </nav>
            </div>
        </header>
    );
}
