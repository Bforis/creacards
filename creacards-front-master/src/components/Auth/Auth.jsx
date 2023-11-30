import React, { useContext, createContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { roomOrigin } from '../../api';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const { search } = useLocation();

    //when page load check user is login or not
    useEffect(() => {
        const openRoutes = ["/", "/signup"];
        const isOpenRoute = openRoutes.includes(window.location.pathname);

        const token = window.localStorage.getItem("token");
        //if user is logged in and trying to access open route
        if (token && isOpenRoute) {
            const searchObj = new URLSearchParams(search);
            const roomId = searchObj.get("roomId");
            if (roomId) {
                navigate(`${roomOrigin}?roomId=${roomId}&token=${token}`);
            }
            return navigate("/user");
        }
        //if user not logged in and route is secured
        if (!token && !isOpenRoute) return navigate("/");

    }, [navigate, search]);

    return (
        <AuthContext.Provider value={{}} >
            {children}
        </AuthContext.Provider>
    )
}