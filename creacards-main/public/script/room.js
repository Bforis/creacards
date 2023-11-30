//STORE VARIABLES OF ALL FILES AND INITIALIZE ROOM CONTENTS

//HTML ELEMENTS
const sliderEl = document.querySelector('.change-canvas');
const contentPanel = document.querySelector('.content-right-wrapper');
const editor = document.querySelector('.editor');
const toolbox = document.querySelector('.tool-box');
const deleteBtn = document.querySelector('.head-2');
const signal = document.querySelector('.head-3');
//STATES
const state = {
    "token": null,
    "roomId": null,
    "canvasInstance": {}, //store fabric instance of all canvas
    "canvasContent": {}, //store content of canvas
    "activeCanvas": {}, //store currently active canvas,
    "activeObject": null,
    "contentPanel": {
        "ready": true, //open content panel when all images and graphics loaded in panel
        "panelId": 0, //by default open graphic panel
        "graphic": {
            "public": [], //store pre uploaded graphics
            "private": [], //store personal graphics,
            "panelId": 0 //by default open pre-uploaded content
        }, //store graphic tab data
        "image": {
            "public": [], //store pre uploaded images
            "private": [], //store personal images
            "panelId": 0 //by default open pre-uploaded content
        } //store image tab data
    },
    "homeLink": "",
    "publishedLink": null,
    "syncRequests": {},
    "socket": {} //store socket connection
}

//handle newly created canvas
function handleNewCanvas(canvas) {
    const canvasCount = Object.keys(state.canvasContent).length;
    //add canvas content in state
    state.canvasContent[canvas._id.toString()] = canvas;
    //append canvas in editor
    const resolution = appendCanvas(canvas);
    //intialiaze fabric instance
    initializeFabricInstance(canvas._id.toString(), resolution);
    return canvasCount;
}

//append new canvas in editor
function appendCanvas(canvas) {
    const canvasWrapper = document.createElement('div');
    canvasWrapper.classList.add('canvas-wrapper');

    const canvasEl = document.createElement('canvas');
    canvasEl.id = `id_${canvas._id}`;
    canvasWrapper.appendChild(canvasEl);

    editor.appendChild(canvasWrapper);
    //fix height and width
    const resolution = {
        width: canvasWrapper.clientWidth,
        height: canvasWrapper.clientHeight
    };

    //if height and width is greater than previous resolution then return previous resolution
    const prevResolution = Object.values(state.canvasContent)[0]?.resolution;
    if (prevResolution) {
        resolution["width"] = prevResolution.width < resolution.width ? prevResolution.width : resolution.width;
        resolution["height"] = prevResolution.height < resolution.height ? prevResolution.height : resolution.height;
    }
    return resolution;
}

/*----FARBIC JS CANVAS INTIALIZATION METHOD START----*/
function initializeFabricInstance(canvasId, resolution) {
    //# STORE NEW CANVAS INSTANCE
    state.canvasInstance[canvasId] = new fabric.Canvas(`id_${canvasId}`);
    state.canvasInstance[canvasId].setDimensions(resolution);

    //# GET CANVAS CONTENT
    const canvasContent = state.canvasContent[canvasId];
    if (canvasContent) {
        //## LOAD ALL TEXTS
        canvasContent.texts.forEach((text) => {
            if (!text.text) return;
            //convert state percentage into pixel
            const newState = scaleObjectState({ ...text.state }, resolution);
            addTextOnCanvas({
                canvasId,
                objectId: text._id,
                text: text.text,
                state: newState || {}
            });
        });
        //## LOAD ALL IMAGES
        canvasContent.images.forEach((image) => {
            if (!image?.imageId || !image?.imageId?.original) return;
            const newState = scaleObjectState({ ...image.state }, resolution);
            addImageOnCanvas(state.canvasInstance[canvasId], {
                canvasId,
                objectId: image._id,
                imageURL: image?.imageId?.original,
                state: newState || {}
            });
        });

        if (canvasContent.backgroundImage && canvasContent.backgroundImage?.imageId?._id) {
            //## LOAD BACKGROUND IMAGE
            addGraphicOnCanvas({
                canvasId,
                graphicId: canvasContent.backgroundImage.imageId._id,
                graphicURL: canvasContent.backgroundImage.imageId.original,
            });
        }
    }

    //ATTACH EVENTS TO CANVAS INSTANCE
    state.canvasInstance[canvasId].on({
        'selection:created': (event) => {
            state.activeObject = event.selected[0]; //store selected object
            deleteBtn.style.display = "inline-block"; //visible delete button
        },
        'selection:cleared': (event) => {
            console.log("cleared");
            state.activeObject = null;
            deleteBtn.style.display = "none"; //hide delete button
        },
        'object:moving': (event) => handleObjectInteraction(event, 'moving'), //track object movement
        'object:scaling': (event) => handleObjectInteraction(event, 'scaling'), //track object scaling
        'object:rotating': (event) => handleObjectInteraction(event, 'rotating'), //track object rotation
        'object:modified': (event) => {
            //add request in request sync state
            const requestId = addRequestStatus();
            //track final interaction with object
            updateObjectStateOnDB(event).finally(() => removeRequestStatus(requestId));
        },
        'text:editing:entered': openToolBox,
        'text:changed': handleTextChange, //track text value change
        'text:editing:exited': async (event) => {
            //close tool box
            toggleToolBox();
            //add request in request sync state
            const requestId = addRequestStatus();
            //update text on db
            updateTextOnDB(event).finally(() => removeRequestStatus(requestId)); //track final text value
            //update object state on DB
            updateObjectStateOnDB(event);
        }
    });

    //ADD CANVAS RESOLUTION IN CANVAS CONTENT
    state.canvasContent[canvasId].resolution = resolution;
}
/*----FARBIC JS CANVAS INTIALIZATION METHOD END----*/

//slide method to move canvas forward and backward
function slide(event) {
    const totalPage = (Object.keys(state.canvasContent).length - 1); //total page index starts from 0
    if (!totalPage) return;
    const move = event.target.id === "prev" ? -1 : 1;
    const currentPage = state.activeCanvas.index;
    let nextPage = currentPage + move;

    //move to first page
    if (totalPage < nextPage) nextPage = 0;
    //move to last page
    if (nextPage < 0) nextPage = totalPage;

    //change canvas view from one page to another
    changeCanvasView({
        id: Object.keys(state.canvasContent)[nextPage],
        name: `Page ${nextPage + 1}`,
        index: nextPage
    });
}
//change canvas view from one to another
function changeCanvasView(selectedCanvas) {
    sliderEl.children[1].textContent = `${selectedCanvas.name}`;
    //hide previous canvas and display selected canvas
    if (state.activeCanvas.index >= 0) {
        editor.children[state.activeCanvas.index].style.display = "none";
    }
    editor.children[selectedCanvas.index].style.display = "block";
    state.activeCanvas = selectedCanvas;
}

//FETCH ROOM DETAILS
async function fetchRoomDetails() {
    const rawResponse = await fetch(roomAPIs.fetchRoom(state.roomId), { method: 'GET', headers: { token: state.token } })
    const res = await rawResponse.json()

    if (res.status !== "success") throw res;

    //get canvases from room details
    const canvases = res.data.room.canvases;

    canvases.forEach((canvas, index) => {
        //store canvas in canvasContent
        state.canvasContent[canvas._id.toString()] = canvas;
        //append canvas in editor
        const resolution = appendCanvas(canvas);
        //intialize fabric instance in canvas
        initializeFabricInstance(canvas._id, resolution);
        //hide canvas 
        editor.children[index].style.display = "none";
    });

    //set published link
    if (res.data.room.cardId) {
        state.publishedLink = `${window.location.origin}/cards/${res.data.room.cardId}`;
        document.querySelector('.published-link').style.display = "block";
    }

    //enable slider button
    if (Object.keys(state.canvasContent).length > 1) {
        sliderEl.children[0].classList.remove('disable');
        sliderEl.children[2].classList.remove('disable');
    }

    //select first canvas
    changeCanvasView({
        id: res.data.room.canvases[0]._id.toString(),
        name: `Page 1`,
        index: 0
    });
}