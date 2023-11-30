//STORE VARIABLES OF ALL FILES AND INITIALIZE CARD CONTENTS

//HTML ELEMENT
const editor = document.querySelector('.cards');
//STATES
const state = {
    "token": null,
    "cardId": null,
    "roomId": null,
    "canvasInstance": {}, //store fabric instance of all canvas
    "canvasContent": {}, //store content of canvas
    "page": 0
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

//SLIDER
function slide(event) {
    const totalCanvas = (Object.keys(state.canvasContent).length - 1); //2
    const moveTo = event.target.id === "prev" ? -1 : 1;  //-1
    if (state.page === 0 && moveTo === -1) return;
    if (state.page === totalCanvas && moveTo === 1) return;

    state.page += moveTo;
    var nextPage = (editor.clientWidth + editor.style.marginLeft + editor.style.marginRight) * (state.page); //414 * -1
    editor.scrollTo(nextPage, 0);

    document.querySelector('.active-canvas').textContent = `Page ${state.page + 1} / ${totalCanvas + 1}`;
}

/*----FARBIC JS CANVAS INTIALIZATION METHOD START----*/
function initializeFabricInstance(canvasId, resolution) {
    //# STORE NEW CANVAS INSTANCE
    state.canvasInstance[canvasId] = new fabric.Canvas(`id_${canvasId}`);
    state.canvasInstance[canvasId].setDimensions(resolution);

    const canvasInstance = state.canvasInstance[canvasId];
    //# GET CANVAS CONTENT
    const canvasContent = state.canvasContent[canvasId];
    if (canvasContent) {
        //## LOAD ALL TEXTS
        console.log("Loading Text!");
        canvasContent.texts.forEach((text) => {
            if (!text.text) return;
            //convert state percentage into pixel
            const newState = scaleObjectState({ ...text.state }, resolution);
            const textInstance = new fabric.Text(text.text, { fontFamily: text.state.fontFamily || ""});
            //SET TEXT STATE
            ['width', 'height'].forEach(field => {
                const scaleMethod = field === "width" ? "scaleX" : "scaleY";
                textInstance[scaleMethod] = newState[field] / textInstance[field];
                delete newState[field];
            });
            textInstance.set({ id: `${text._id}`, ...newState, selectable: false });
            //ADD TEXT ON CANVAS
            canvasInstance.add(textInstance);
        });
        //## LOAD ALL IMAGES
        console.log("Loading Image!");
        canvasContent.images.forEach((image) => {
            if (!image?.imageId || !image?.imageId?.original) return;
            const newState = scaleObjectState({ ...image.state }, resolution);
            fabric.Image.fromURL(`${image?.imageId?.original}?v=${Math.random() * 1}`, function (img) {
                img.id = image._id;
                //Set Height Width
                ["height", "width"].forEach(field => {
                    const scaleMethod = field === "width" ? "scaleX" : "scaleY";
                    img[scaleMethod] = (newState[field] / img[field]);
                    delete newState[field];
                });
                //Set rest image state
                img.set({ ...newState, selectable: false });
                canvasInstance.add(img);
            }, { crossOrigin: "anonymous" });
        });

        if (!canvasContent.backgroundImage) return;

        //## LOAD GRAPHICS
        if (!canvasContent.backgroundImage?.imageId?.original) return;
        console.log("Loading Graphic!");
        fabric.Image.fromURL(`${canvasContent.backgroundImage?.imageId?.original}?v=${Math.random() * 1}`, function (img) {
            img.id = canvasContent.backgroundImage?.imageId?._id;
            img.scaleX = canvasInstance.width / img.width;
            img.scaleY = canvasInstance.height / img.height;
            canvasInstance.setBackgroundImage(img, canvasInstance.renderAll.bind(canvasInstance), {});
        }, { crossOrigin: "anonymous" });

        //ADD CANVAS RESOLUTION IN CANVAS CONTENT
        state.canvasContent[canvasId].resolution = resolution;
    }
}
/*----FARBIC JS CANVAS INTIALIZATION METHOD END----*/


//FETCH ROOM DETAILS
async function fetchCardDetails() {
    const rawResponse = await fetch(`/api/v1/cards/${state.cardId}`, { method: 'GET', headers: { token: state.token } })
    const res = await rawResponse.json()

    if (res.status !== "success") throw res;

    state["roomId"] = res.data.card?.roomId;
    const canvases = res.data.card.canvases;

    canvases.forEach((canvas, index) => {
        //store canvas in canvasContent
        state.canvasContent[canvas._id.toString()] = canvas;
        //append canvas in editor
        const resolution = appendCanvas(canvas);
        //intialize fabric instance in canvas
        initializeFabricInstance(canvas._id, resolution);
    });
    document.querySelector('.active-canvas').textContent = `Page ${state.page + 1} / ${canvases.length}`;
}

function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.setAttribute("href", uri);
    link.setAttribute("download", name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}

function downloadImage(event) {
    Object.keys(state.canvasInstance).forEach((canvas, index) => {
        const canvasInstance = state.canvasInstance[canvas];
        const dataURL = canvasInstance.toDataURL({
            format: "png",
            width: canvasInstance.width,
            height: canvasInstance.height
        });
        downloadURI(dataURL, `card ${index + 1}`);
    })
}

function gotoRoom() {
    window.location.href = `/${state.roomId}`;
}

//INITIALIZE ROOM DETAILS WHEN PAGE LOAD
window.addEventListener('DOMContentLoaded', async function () {
    try {

        //load cardId
        state.cardId = window.location.pathname.split('/')[2];
        //load token
        state.token = new URLSearchParams(window.location.search).get('token');
        //load font then fetch card details
        document.fonts.addEventListener('loadingdone', async () => {
            //load card data
            await fetchCardDetails();
        });
    } catch (err) {
        console.log(err);
        alert(err.message)
    }
});