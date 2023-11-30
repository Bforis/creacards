import React, { useEffect, useState } from 'react';

import axios from 'axios';

import { useNavigate, useLocation } from 'react-router-dom';
import { roomOrigin, userAPIs } from '../../api';

import './form.css';

function Login() {

    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState({});
    const [credentials, setCredentials] = useState({ email: null, password: null });

    const navigate = useNavigate();
    //Extract redirect route from url
    const { search } = useLocation();

    //update credential state
    const handleInput = (event) => {
        credentials[event.target.name] = event.target.value;
        setCredentials({ ...credentials });
    }

    //login user from
    const handleLogin = async () => {
        //prevent another request if previous request is pending
        if (loading) return;

        setLoading(true);

        //check credentials is provided or not
        if (!credentials.email || !credentials.password)
            alert("Please fill fields");

        //send login request to server
        axios.post(userAPIs.login, credentials, {
            header: {
                "Content-Type": "application/json",
            },
            validateStatus: () => true
        }).then(res => {

            if (res.data.status !== "authorized") {
                alert(res.data.message);
                return;
            }
            //store token in localstorage
            window.localStorage.setItem("token", res.data.token);


            //redirect user to room page
            if (query.roomId) {
                console.log(`${roomOrigin}/${query.roomId}`);
                window.location.href = `${roomOrigin}?roomId=${query.roomId}&token=${res.data.token}`;
                return;
            }

            //redirect user to other page
            if (query.redirectTo) {
                window.location.href = query.redirectTo;
                return;
            }

            //redirect user to dashboard based on role
            const routeTo = res.data.data.role === "admin" ? "/admin" : "/user";
            navigate(routeTo);

        }).catch(err => alert(err.message)).finally(() => setLoading(false));
    }

    useEffect(() => {
        const queryObj = new URLSearchParams(search);
        setQuery({
            roomId: queryObj.get("roomId"),
            redirectTo: queryObj.get("redirectTo")
        });
    }, [search]);

    useEffect(() => {
       console.log(query);
    }, [query])

    return (
        <div className='container'>

            <div className='form-container'>
                <h2>Login</h2>

                <div className='form'>
                    <div className='input-container'>
                        <label>Email</label>
                        <input name="email" onChange={(e) => handleInput(e)} type='text' />
                    </div>
                    <div className='input-container'>
                        <label>Password</label>
                        <input name="password" onChange={(e) => handleInput(e)} type="password" />
                    </div>
                    <button onClick={() => handleLogin()} className={`btn ${loading ? "disable" : ""} `}>{loading ? "Logging..." : "Login"}</button>
                </div>

                <div className='link'>
                    <span>New user ? </span>&nbsp;<span onClick={() => navigate("/signup")}>Signup</span>
                </div>
            </div>

        </div>
    );
}

export default Login