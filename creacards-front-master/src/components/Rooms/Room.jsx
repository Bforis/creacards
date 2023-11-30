import { useState, useEffect } from 'react';

import './room.css';
import Header from '../Header/Header';
import { roomAPIs, roomOrigin } from '../../api';

function Rooms() {

    const [rooms, setRooms] = useState([]);

    const fetchRooms = async () => {
        const token = window.localStorage.getItem("token");
        const response = await fetch(`${roomAPIs.fetchRooms}?fields=canvases,owner`, { method: "GET", headers: { token } });
        const res = await response.json();
        if (res.status !== "success") throw res;
        return res.data;
    }

    const deleteRoom = async (roomId) => {
        try {
            const token = window.localStorage.getItem("token");
            const response = await fetch(`${roomAPIs.deleteRoom(roomId)}`, { method:"DELETE", headers: { token } });
            const res = await response.json();
            if (res.status !== "success") throw res;
            setRooms([...rooms.filter(room => `${room._id}` !== roomId)]);
        } catch (err) {
            alert(err.message)
        }
    }

    function navigateToRoom(roomId) {
        if (!roomId) return;
        const token = window.localStorage.getItem("token")
        window.location.href = `${roomOrigin}/${roomId}?token=${token}`;
    }

    function navigateToCard(cardId) {
        if (!cardId) return;
        window.location.href = `${roomOrigin}/cards/${cardId}`;
    }

    useEffect(() => {
        fetchRooms().then(data => {
            setRooms(data.rooms)
        }).catch(err => alert(err.message))
    }, []);

    return <div className="rooms">
        <Header headerText={"Rooms"} back={true} />
        {rooms.length ? rooms.map((room, index) => {

            return <div key={index} className="room">
                <div className='room-upper'>
                    <span><i className='fa fa-users'></i>{" "}{room.users.length}</span>
                    <span ><i className='fa fa-file' style={{ color: "royalblue" }} ></i>{" "}{room.canvases.length}</span>
                    <span onClick={() => navigateToRoom(room._id)}><i className='action fa fa-door-open' style={{ color: "brown" }}></i>{" "}</span>
                    <span onClick={() => navigateToCard(room.cardId)}><i className='action fa fa-globe' style={{ color: room.cardId ? "green" : "orangered" }}></i>{" "}</span>
                    <span onClick={() => deleteRoom(room._id)}><i className='action fa fa-trash' style={{ color: "orangered" }}></i></span>
                </div>
                <div>
                    <span style={{ color: "grey", fontSize: "0.9rem" }}>{new Date(room.createdAt).toDateString()}</span>
                </div>
            </div>
        }) : ""}
    </div>
}

export default Rooms;