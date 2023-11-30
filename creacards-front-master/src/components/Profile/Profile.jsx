import React, { useEffect, useState } from "react";

import axios from "axios";
import { userAPIs } from '../../api';

import './profile.css';

import Header from '../Header/Header';

function Profile(props) {

    const [user, setUser] = useState({});
  
    const token = window.localStorage.getItem("token");
    //fetch user details
    useEffect(() => {

        //fetch users
        axios.get(userAPIs.getUser, {
            headers: { token }
        }).then(res => {
            setUser({
                name: res.data.data?.user?.name,
                email: res.data.data?.user?.email,
                subscription: res.data.data?.user?.subscription
            });
        }).catch(err => err.message);

    }, [token]);


    return (<div className="profile-container">
        <Header headerText={"Profile"} back={true} />
        <ul className="profile">
            <li>
                <span className="label">Name</span>
                <span>{user.name}</span>
            </li>
            <li>
                <span className="label">Email</span>
                <span>{user.email}</span>
            </li>
            <li>
                <span className="label">Membership</span>
                <span>{user.subscription}</span>
            </li>
        </ul>

    </div>)
}

export default Profile;