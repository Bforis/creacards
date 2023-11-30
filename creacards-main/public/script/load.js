//INITIALIZE ROOM DETAILS WHEN PAGE LOAD
window.addEventListener('DOMContentLoaded', async function () {
    try {
        //load roomId
        state.roomId = window.location.pathname.split('/')[1];
        //load token
        state.token = new URLSearchParams(window.location.search).get('token');

        //load graphic data
        await fetchPanelContents(graphicAPIs.fetchGraphics, "graphic", 0);
        //load image data
        await fetchPanelContents(imageAPIs.fetchImages, "image", 1);
        //load fonts
        loadFonts();
        document.fonts.addEventListener('loadingdone', async (e) => {
            console.log("All font Loaded");
            //load room data
            await fetchRoomDetails();
            //initialize socket connection
            state.socket = io.connect('/', { query: { 'token': state.token } });
            //intialize socket event handler
            initializeSocketEventHandler(state.socket);
            //join user in room
            state.socket?.emit('join-room', state.roomId);
        });
    } catch (err) {
        console.log(err);
        alert(err.message)
    }
});