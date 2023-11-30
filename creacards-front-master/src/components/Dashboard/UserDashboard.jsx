import React from 'react';
import { useNavigate } from 'react-router-dom';

import './dashboard.css';

import Header from '../Header/Header';

function UserDashboard(props) {

    const navigate = useNavigate();

    return (
        <div className='dashboard'>
            <Header headerText={"User Dashboard"} back={false} logout={true} />
            {/*navigations*/}
            <ul className='nav-links'>
                <li className='link' onClick={props.createRoom}>{props.loading ? "Creating Room..." : "Create Room"}</li>
                <li className='link' onClick={() => navigate("/rooms")}>Rooms</li>
                <li className='link' onClick={() => navigate("/profile")}>Profile</li>
                <li className='link' onClick={() => navigate("/user/subscriptions")}>Subscriptions</li>
            </ul>
        </div>
    );
}

export default UserDashboard;