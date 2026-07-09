import { LoaderCircle } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function ProtectedRoute() {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="grid min-h-screen place-items-center">
                <LoaderCircle className="animate-spin text-brand-600" aria-label="Loading" />
            </div>
        );
    }
    return isAuthenticated ? <Outlet /> : <Navigate to="/auth" state={{ from: location }} replace />;
}
