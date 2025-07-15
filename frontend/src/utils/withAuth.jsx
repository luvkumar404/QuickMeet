import { useEffect } from "react";
import { useNavigate } from "react-router-dom"

const withAuth = (WrappedComponent, a = true) => {
    const AuthComponent = (props) => {
        const router = useNavigate();

        const isAuthenticated = () => {
            if (localStorage.getItem("token")) {
                return true;
            }
            return false;
        }

        useEffect(() => {
            if (!isAuthenticated() && a) {
                router("/auth")
            }

            if(isAuthenticated() && !a) {
                router("/home");
            }


        }, [])

        return <WrappedComponent {...props} />
    }

    return AuthComponent;
}

export default withAuth;