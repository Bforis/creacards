//HANDLE SOCKET EVENTS

function initializeSocketEventHandler(socket) {

    socket?.on('new-canvas', canvas => {
        const index = handleNewCanvas(canvas); //return position of last canvas
        //hide latest canvas
        editor.children[index].style.display = "none";
    });

    //UPDATE CANVAS INSTANCE

    //1. Add New Image On Canvas
    socket?.on('new-image', ({ canvasId, data }) => {
        //scale object state
        const resolution = state.canvasContent[canvasId].resolution; //Scale object according to canvas resolution
        const canvasInstance = state.canvasInstance[canvasId]; //Get canvas instance
        //add image on canvas
        addImageOnCanvas(canvasInstance, {
            objectId: `${data._id}`,
            canvasId,
            imageURL: data?.imageId?.original,
            state: scaleObjectState(data.state, resolution)
        });
        //update state of canvas content
        state.canvasContent[canvasId].images.push(data);
    });

    //2. Add New Text On Canvas
    socket?.on('new-text', ({ canvasId, data }) => {
        //scale object state
        const resolution = state.canvasContent[canvasId].resolution; //Scale object according to canvas resolution
        const newState = scaleObjectState({ ...data.state }, resolution);
        //add text on canvas
        addTextOnCanvas({
            objectId: `${data._id}`, //mongo db id as a object if fabric canvas
            canvasId,
            text: data?.text,
            state: newState
        });
        //update state of canvas content
        state.canvasContent[canvasId].texts.push(data);
    });

    //3. Add New Graphic On Canvas
    socket?.on('new-graphic', (payload) => {
        //add graphic on canvas
        addGraphicOnCanvas(payload);
        //store graphic on canvas state
        state.canvasContent[payload.canvasId].backgroundImage = {
            imageId: {
                _id: payload.graphicId,
                original: payload.graphicURL
            }
        }
    });

    //4. Close Panel after adding image and graphics
    socket.on('close-panel', () => toggleContentPanel());


    //HANDLE REALTIME TEXT UPDATE
    socket.on('text-changed', (data) => {
        //update text on canvas instance
        updateObjectStateOnCanvas(data);
    });

    //HANDLE REALTIME OBJECT INTERACTION
    socket.on('object-interaction', (data) => {
        //update object state on canvas instance
        updateObjectStateOnCanvas(data);
        //update state of canvas content
        updateObjectState(data);
    });

    //HANDLE OBJECT DELETE
    socket.on('objects-deleted', (data) => {
        const canvasInstance = state.canvasInstance[data.canvasId];
        canvasInstance.getObjects().forEach(obj => {
            if (!data.payload.includes(obj.id)) return;
            canvasInstance.remove(obj);
        });
    });

    socket?.on('response', res => alert(res.message));

    socket?.on('error', message => alert(message));

    socket?.on('disconnected', (message) => {
        alert(message);
        signal.style.color = "orangered";
    })
}