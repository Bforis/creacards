//CONTAIN METHODS RELATED TO CANVAS EDITOR

//INSERT NEW IMAGE ON CANVAS
function addImageOnCanvas(canvas, imagePayload) {

    fabric.Image.fromURL(imagePayload.imageURL, function (img) {
        img.id = imagePayload.objectId;
        ["width", "height"].forEach(field => {
            const scaleMethod = field === "width" ? "scaleX" : "scaleY";
            img[scaleMethod] = imagePayload.state[field] / img[field];
            delete imagePayload.state[field];
        });
        //Set rest image state
        img.set(imagePayload.state);
        canvas.add(img);
    });
}

/**
 * @description add image on canvas and send new image to other users in room
 */
function addImage(event) {
    const imageId = event.target.id;
    if (!imageId) return;
    //get image object from state
    const content = getContent(state, "image", imageId);
    if (!content) {
        alert("Content not found!");
        return;
    }
    const payload = {
        canvasId: state.activeCanvas.id,
        imageId: content._id,
        imageURL: content.original || content.preview,
        state: { top: 1, left: 1, width: 10, height: 10 }
    }

    //add image to other users canvas
    state.socket?.emit('new-image-added', { roomId: state.roomId, payload });
}

/**
 * @description interact with canvas and add graphic on canvas
 */
function addGraphicOnCanvas(graphic) {
    //get canvas instance to add image in canvas
    const canvasInstance = state.canvasInstance[graphic.canvasId];
    fabric.Image.fromURL(graphic.graphicURL, function (img) {
        img.id = graphic.graphicId;
        img.scaleX = canvasInstance.width / img.width;
        img.scaleY = canvasInstance.height / img.height;
        canvasInstance.setBackgroundImage(img, canvasInstance.renderAll.bind(canvasInstance), {});
    });
}

/**
 * @description add graphic on canvas and send graphic to other users in room
 */
function addGraphic(event) {
    const bgImageId = event.target.id;
    if (!bgImageId) return;
    //get image object from state
    const content = getContent(state, "graphic", bgImageId);
    if (!content) {
        alert("Content not found!");
        return;
    }

    const payload = {
        canvasId: state.activeCanvas.id,
        graphicId: content._id,
        graphicURL: content.original || content.preview,
        state: {}
    }

    //add image to other users canvas
    state.socket?.emit('new-graphic-added', { roomId: state.roomId, payload });
}


/**
 * @description interact with canvas and add new text on canvas
*/
function addTextOnCanvas(textContent) {
    const canvasInstance = state?.canvasInstance[textContent.canvasId];
    const text = new fabric.IText(textContent.text, { fontFamily:textContent.state.fontFamily || "" });
    //SET TEXT STATE
    ['width', 'height'].forEach(field => {
        const scaleMethod = field === "width" ? "scaleX" : "scaleY";
        text[scaleMethod] = textContent.state[field] / text[field];
        delete textContent.state[field];
    });
    text.set({ id: textContent.objectId, ...textContent.state });
    //ADD TEXT ON CANVAS
    canvasInstance.add(text);
}

/**
 * @description add new text on canvas and send new text to other users in room
 */
function addText() {
    const payload = {
        //objectId: `text_${Date.now().toString(16)}`, //temp text id replace with mongodb id
        canvasId: state.activeCanvas.id,
        text: 'Enter Text',
        state: {  //default state
            top: 1,
            left: 1,
            width: 50,
            height: 30
        }
    }

    //const newState = scaleObjectState({ ...payload.state }, state.canvasContent[payload.canvasId].resolution);
    //addTextOnCanvas({ ...payload, state: newState });
    //emit new text update event
    state?.socket?.emit("new-text-added", { roomId: state.roomId, payload });
}


/**
 * @description track object scaling,movement and rotation. and send realtime interation to other users in room
 */
function handleObjectInteraction(event, eventType) {

    if (!event.target) return;
    const objectId = event.target.id;
    const object = state.activeObject;

    if (!object) return;

    const activeCanvas = state.canvasInstance[state.activeCanvas.id];

    const objectState = {};

    switch (eventType) {
        case 'moving':
            //calculate movement in percentage
            objectState["left"] = ((object.left / activeCanvas.width) * 100);
            objectState["top"] = ((object.top / activeCanvas.height) * 100);
            break;
        case 'rotating':
            objectState["left"] = ((object.left / activeCanvas.width) * 100);
            objectState["top"] = ((object.top / activeCanvas.height) * 100);
            objectState["angle"] = object.angle;
            break;
        case 'scaling':
            objectState["left"] = ((object.left / activeCanvas.width) * 100);
            objectState["top"] = ((object.top / activeCanvas.height) * 100);
            objectState["width"] = ((object.getScaledWidth() / activeCanvas.width) * 100);
            objectState["height"] = ((object.getScaledHeight() / activeCanvas.height) * 100);
            break;
    };

    const data = {
        canvasId: state.activeCanvas.id,
        objectId,
        objectType: getObjectType(object),
        objectState: objectState
    }

    const isUpdated = updateObjectState(data);
    if (!isUpdated) return;

    //send the updated state to other users
    state.socket?.emit('object-interaction', {
        roomId: state.roomId,
        payload: {
            action: eventType,
            ...data
        }
    });
}

/**
 * @description send live user input value to other users in room
 */
function handleTextChange(event) {

    if (!event.target.id) return;

    state.socket?.emit('text-changed', {
        roomId: state.roomId,
        payload: {
            canvasId: state.activeCanvas.id,
            objectId: event.target.id,
            text: event.target.text
        }
    });
}

/**
 * @description update text property on canvas and send updated property to other others in room
 */
function updateTextPropery(event) {

    const payload = {
        action: 'default',
        canvasId: state.activeCanvas.id,
        objectId: state.activeObject.id,
        objectType: "texts",
        objectState: { //input element name is the name of object property
            [event.target.name]: event.target.value
        }
    }

    state.activeObject.set(payload.objectState);
    state.canvasInstance[state.activeCanvas.id].renderAll();

    //send the updated state to other users
    state.socket?.emit('object-interaction', {
        roomId: state.roomId,
        payload: payload
    });
    //update local canvas state
    updateObjectState(payload);
}

/**
 * @description update canvas with new object state received from other users
 * update:-> text property, text value, object movement, object rotation and object scaling
 */
function updateObjectStateOnCanvas(data) {
    const object = getObjectInstance({ canvasId: data.canvasId, objectId: data.objectId });
    //if object not found return
    if (!object) return false;
    const resolution = state.canvasContent[data.canvasId].resolution;

    switch (data.action) {
        case "moving":
            let movement1 = scaleMovement({ ...data.objectState }, resolution);
            object.set({ top: movement1.top, left: movement1.left });
            object.setCoords();
            break;
        case "rotating":
            let movement2 = scaleMovement({ ...data.objectState }, resolution);
            object.set({ angle: data.objectState.angle, top: movement2.top, left: movement2.left });
            object.setCoords();
            break;
        case "scaling":
            const newState = scaleObjectState({ ...data.objectState }, resolution);
            object.set({
                top: newState.top,
                left: newState.left,
                scaleX: (newState.width / object.width),
                scaleY: (newState.height / object.height)
            });
            break;
        case "text:editing":
            object.set({ text: data.text });
            break;
        default: //default set any property [mainly update text color and fontfamily]
            object.set(data.objectState);
            object.setCoords();
            break;
    }

    state.canvasInstance[data.canvasId].renderAll(); //render updates

    return true;
}