//CONTAIN METHODS RELATED TO ROOM HEADER SECTION

//redirect to home page
function gotoHome() {
    window.location.href = 'https://master.d350hdg6wok4tn.amplifyapp.com';
}

//open close image and graphics content panel
let rotate = 0;
function toggleContentPanel() {

    //prevent panel from closing on device of width greater than 999
    if (document.body.clientWidth >= 1000) return;

    rotate = rotate === 180 ? 0 : 180;
    if (!state.contentPanel.ready) {
        alert('content panel is not ready!');
        return;
    }
    document.querySelector('.panel').classList.toggle('translateLeft');
    document.querySelector('#c-btn').style.transform = `rotate(${rotate}deg)`;
}

//add new canvas in lists
function addNewCanvas() {
    fetch(roomAPIs.createCanvas(state.roomId), { method: 'PUT', headers: { token: state.token } })
        .then(res => res.json())
        .then(res => {
            if (res.status !== "success") throw res;
            const canvas = res.data.canvas;
            //send canvas to other users in rooms
            state.socket?.emit('new-canvas-added', { roomId: state.roomId, canvas: canvas });
            const canvasCount = handleNewCanvas(canvas);
            //change view
            changeCanvasView({ id: canvas._id.toString(), name: `Page ${canvasCount + 1}`, index: canvasCount })
        })
        .catch(err => {
            console.log(err);
            alert(err.message)
        })
}

//display and hide list of canvases
function displayCanvasList() {
    dataList.classList.toggle('hide-list');
}

//copy room link
function copyLink() {
    const linkText = `${window.location.origin}?roomId=${state.roomId}`;
    window.navigator.clipboard.writeText(linkText)
        .then(() => alert("Text Copied"))
        .catch(() => alert("Failed to copy text!"));
}

//publish card
function publishCard() {
    const isAllSynced = !Object.keys(state.syncRequests)[0];
    if (!isAllSynced) {
        alert("Please wait! data sync is in progress!");
        return;
    }
    fetch(`/api/v1/cards?roomId=${state.roomId}`, {
        method: "GET",
        headers: {
            token: state.token
        }
    })
        .then(res => res.json())
        .then(res => {
            if (res.status !== "success") throw res;
            if (!state.publishedLink) {
                document.querySelector('.published-link').style.display = "block";
            }
            state.publishedLink = res.data.link;
            console.log(res.data.link);
            alert("Page published successfully!");
        })
        .catch(err => alert(err.message))
}

//Navigate to link
function navigateToLink() {
    if (!state.publishedLink) return;
    window.location.href = state.publishedLink;
}