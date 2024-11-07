import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const ReactContext = ({ element }) => {
    const token = Cookies.get("jwt_token");
    
    // Check if JWT token exists, if not, redirect to login
    if (token) {
        return element; // If authenticated, render the passed component
    }

    return <Navigate to="/login" />; // Redirect to login if not authenticated
};

export default ReactContext;
