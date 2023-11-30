import React, { useState } from 'react';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { userAPIs } from '../../api';

import './form.css';

function Signup() {

    const [credentials, setCredentials] = useState({
        name: null,
        email: null,
        password: null
    });

    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    //update credential state
    const handleInput = (event) => {
        credentials[event.target.name] = event.target.value;
        setCredentials({ ...credentials });
    }

    //login user from
    const handleSignup = async () => {

        //if request already pending prevent another request
        if (loading) return;
        //disable button
        setLoading(true);
        //validate fields 
        if (!credentials.name || !credentials.email || !credentials.password)
            alert("Please fill fields");

        //send signup request to server
        axios.post(userAPIs.signup, credentials, {
            header: {
                "Content-Type": "application/json",
            },
            validateStatus: () => true
        })
            .then(res => {
                if (res.data.status !== "authorized") {
                    alert(res.data.message);
                    return;
                }
                //store token in localstorage
                window.localStorage.setItem("token", res.data.token);
                //redirect user to dashboard based on role
                const routeTo = res.data.data.role === "admin" ? "/admin" : "/user";
                navigate(routeTo);
            })
            .catch(err => alert(err.message))
            .finally(() => setLoading(false));
    }

    return (
        <div className='container'>

            <div className='form-container'>
                <h2>Signup</h2>
                {/**from */}
                <div className='form'>
                    <div className='input-container'>
                        <label>Name</label>
                        <input name="name" onChange={(e) => handleInput(e)} type="text" />
                    </div>
                    <div className='input-container'>
                        <label>Email</label>
                        <input name="email" onChange={(e) => handleInput(e)} type='text' />
                    </div>
                    <div className='input-container'>
                        <label>Password</label>
                        <input name="password" onChange={(e) => handleInput(e)} type="password" />
                    </div>
                    <button onClick={() => handleSignup()} className={`btn ${loading ? "disable" : ""}`}>{loading ? "Signing..." : "Signup"}</button>
                </div>

                <div className='link'>
                    <span>Already a user ? </span>&nbsp;<span onClick={() => navigate("/")}>Login</span>
                </div>
            </div>

        </div>
    );
}

export default Signup;