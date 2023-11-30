import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import Login from './components/Form/Login';
import Signup from './components/Form/Signup';
import Profile from './components/Profile/Profile';
import Rooms from './components/Rooms/Room';

import AdminDashboard from './components/Dashboard/AdminDashboard';
import ImagesPage from './components/Content/ImagesPage';
import GraphicsPage from './components/Content/GraphicsPage';

import UserDashboard from './components/Dashboard/UserDashboard';
import Subscription from './components/Subscription/Subscription';

import { AuthProvider } from './components/Auth/Auth';

import axios from 'axios';
import { roomOrigin, roomAPIs } from './api';

function App() {

  const token = window.localStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  //call create room function then redirect user to room link
  const createRoom = async () => {
    try {
      if (loading) return; //if request is pending return

      setLoading(true) //start loading
      const res = await axios.get(roomAPIs.createRoom, {
        headers: { token },
        validateStatus: () => true
      });

      if (res.data.status !== "success") {
        alert(res.data.message)
        return;
      }

      const roomId = res.data.data.roomId;
      window.location.href = `${roomOrigin}?roomId=${roomId}&token=${token}`;
    } catch (err) {
      alert(err.message)
    }

    setLoading(false); //stop loading
  }

  return (
    <div className="App">
      <AuthProvider>
        <Routes>
          {/*global*/}
          <Route path='/' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/rooms" element={<Rooms />} />
          {/*admin routes*/}
          <Route path='/admin' element={<AdminDashboard loading={loading} createRoom={createRoom} />} />
          <Route path="/admin/images" element={<ImagesPage />} />
          <Route path="/admin/graphics" element={<GraphicsPage />} />
          {/**user routes */}
          <Route path='/user' element={<UserDashboard loading={loading} createRoom={createRoom} />} />
          {/*<Route path='/user/rooms/:roomId' element={<Room />} />*/}
          <Route path='/user/subscriptions' element={<Subscription />} />
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;
