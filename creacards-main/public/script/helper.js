//CONTAINS HELPER METHODS TO PERFROM SMALL TASKS

//scale object state according to canvas resolution
function scaleObjectState(ste, resolution) {
    if (!ste) return;
    ste = scaleMovement(ste, resolution); //scale top left property according to canvas resolution;
    ste = scaleSize({ ...ste }, resolution);
    return ste;
}

//simply convert percentage value in px
function scaleMovement(ste, resolution) {
    ste["top"] = ((ste["top"]) / 100) * resolution.height;
    ste["left"] = ((ste["left"]) / 100) * resolution.width;
    return ste;
}

//simply convert percentage value in px
function scaleSize(ste, resolution) {
    ["width", "height"].forEach(field => {
        ste[field] = (ste[field] / 100) * resolution[field];
    });
    return ste;
}

//Get selected content from images and graphics state
function getContent(state, contentType, contentId) {
    const contentPanel = state.contentPanel[contentType];
    const openPanel = ['public', 'private'][contentPanel.panelId];//get open panel
    const contents = contentPanel[openPanel]; //get private or public contents array
    //find selected content
    return contents.find(content => content._id === contentId);
}

function getObjectType(object) {
    return {
        'image': 'images',
        'i-text': 'texts',
        'text': 'texts'
    }[object.get('type')];
}

function getObjectInstance({ canvasId, objectId }) {
    const objects = state.canvasInstance[canvasId].getObjects();
    return objects.find(object => object.id === objectId);
}

//get index of object in canvas content
function getObjectIndex({ canvasId, objectId, objectType }) {
    //get array of objects
    const objects = state.canvasContent[canvasId][objectType];
    if (!objects) return;
    //find object index
    return objects.findIndex(object => object._id.toString() === objectId);
}

//update canvas object state
function updateObjectState({ canvasId, objectId, objectType, objectState }) {
    //get array of objects
    const objects = state.canvasContent[canvasId][objectType];
    //find object to update
    const activeObjectIndex = getObjectIndex({ canvasId, objectId, objectType });
    //return false if object not found
    if (activeObjectIndex < 0) return false;
    //update state
    state.canvasContent[canvasId][objectType][activeObjectIndex].state = {
        ...objects[activeObjectIndex].state,
        ...objectState
    };
    return state.canvasContent[canvasId][objectType][activeObjectIndex].state;
}

//Methods Related to toolbox
function updateToolBoxPos(pos) {
    toolbox.style.left = `${pos.canvasOffset.left + pos.objectX}px`;
    toolbox.style.top = `${pos.canvasOffset.top + pos.objectY + pos.height}px`;
}

function toggleToolBox() {
    toolbox.classList.toggle('open-tool-box');
}

function openToolBox(event) {
    updateToolBoxPos({
        height: event.target.getScaledHeight(),
        canvasOffset: state.canvasInstance[state.activeCanvas.id]._offset,
        objectX: event.target.left,
        objectY: event.target.top
    });
    toggleToolBox();
}

//Load fonts on toolbox
function loadFonts() {
    const listContainer = toolbox.children[0].children[1];
    const fontEntries = document.fonts.entries();
    let done = false, index = 0;
    const fontTexts = [], data = [];
    while (!done) {
        const font = fontEntries.next();
        if (font.done) {
            break;
        }

        font.value[0].load().then((fontData) => {
            data.push(fontData)
            const fontFamily = fontData.family;
            if (fontTexts.includes(fontFamily)) return; //font alreadylisted move to next font
            //append list in lists
            const option = document.createElement('option');
            option.value = fontFamily;
            option.textContent = fontFamily;
            listContainer.appendChild(option);
            //store font text in array
            fontTexts.push(fontFamily);
            //remove font loading from state and trigger fetch room details functions
            //delete state.fontLoading[index];
            //Object.keys(state.fontLoading).length;
        }).catch(err => console.log(err.message));
        index += 1;
    }
}


//Manage Sync Request
function addRequestStatus() {
    const requestId = Object.keys(state.syncRequests).length;
    state.syncRequests[requestId] = true;
    if (requestId === 0)
        signal.classList.add('load');
    return requestId;
}

function removeRequestStatus(requestId) {
    delete state.syncRequests[requestId];
    const remReq = Object.keys(state.syncRequests).length;
    if (remReq === 0)
        signal.classList.remove('load');
}