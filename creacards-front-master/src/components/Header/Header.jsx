import React from "react";

import { useNavigate } from "react-router-dom";

import './header.css';

function Header(props) {

    const navigate = useNavigate();

    //logout function
    const logout = () => {
        window.localStorage.removeItem("token");
        navigate("/");
    }

    return <header>
        <h1>{props.headerText}</h1>
        {props.back && <div className="btn" onClick={() => navigate(-1)}>back</div>}
        {props.logout && <div className="btn" onClick={logout}>logout</div>}
        {props.children}
    </header>
}

export default Header