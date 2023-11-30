import React from 'react';
import { useNavigate } from 'react-router-dom';

import './dashboard.css';

import Header from '../Header/Header';

function AdminDashboard(props) {

    const navigate = useNavigate();

    //call create room function then redirect user to room link

    return (
        <div className='dashboard'>
            <Header headerText={"Admin Dashboard"} back={false} logout={true} />
            {/*navigations*/}
            <ul className='nav-links'>
                <li className='link' onClick={props.createRoom}>{props.loading ? "Creating Room..." : "Create Room"}</li>
                <li className='link' onClick={() => navigate("/rooms")}>Rooms</li>
                <li className='link' onClick={() => navigate("/admin/images")}>Manage Images</li>
                <li className='link' onClick={() => navigate("/admin/graphics")}>Manage Graphics</li>
                <li className='link' onClick={() => navigate("/profile")}>Profile</li>
            </ul>
        </div>
    );
}

export default AdminDashboard;