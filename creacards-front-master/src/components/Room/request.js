import axios from 'axios';
import { roomAPIs } from '../../api';

/**fetch room*/
export const fetchRoomReq = async (token, roomId) => {
    const res = await axios.get(roomAPIs.fetchRoom(roomId), {
        headers: { token },
        ValidityState: () => true
    });

    return res.data.data.room;
}
/**create canvas*/
export const createCanvasReq = async (token, roomId) => {
    const res = await axios.put(roomAPIs.createCanvas(roomId), {}, {
        headers: { token },
        validityState: () => true
    });

    return res.data.data.canvas;
}