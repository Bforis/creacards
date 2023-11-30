/**
*@description API Request I: Update object state in canvas doc after final interaction of object.
(scaling, movement, rotation, text property update)
*/
async function updateObjectStateOnDB(event) {
    try {
        if (!event.target) return;
        const objectId = event.target.id;
        const object = state.activeObject;
        if (!object) return;

        const data = {
            canvasId: state.activeCanvas.id,
            objectId,
            objectType: getObjectType(object),
        };

        const objectIndex = getObjectIndex(data);
        if (objectIndex < 0) return;
        //get object state
        data["objectState"] = state.canvasContent[data.canvasId][data.objectType][objectIndex].state;
        //send update request to server
        await fetch(roomAPIs.updateCanvasObject(state.roomId, data.canvasId, data.objectId), {
            method: "PATCH",
            headers: {
                "Content-Type": 'application/json',
                token: state.token
            },
            body: JSON.stringify({
                "objectType": data.objectType,
                "state": data.objectState
            }),
        });

    } catch (err) {
        signal.style.color = "orangered";
        alert(err.message);
    }
}

/**
 * @description API Request II: update new text value on canvas document when user exit from text editing 
 */
async function updateTextOnDB(event) {
    try {
        const data = {
            canvasId: state.activeCanvas.id,
            objectId: event.target.id,
            objectType: "texts"
        };
        //if object text and canvas state text is equal prevent text update
        const objectIndex = getObjectIndex(data);
        console.log(`${event.target.text} - ${state.canvasContent[data.canvasId]?.texts[objectIndex]?.text}`)
        if (event.target.text === state.canvasContent[data.canvasId]?.texts[objectIndex]?.text)
            return;

        data["text"] = event.target.text;

        //send update request to server
        await fetch(roomAPIs.updateCanvasContent(state.roomId, data.canvasId, data.objectId), {
            method: "PATCH",
            headers: {
                "Content-Type": 'application/json',
                token: state.token
            },
            body: JSON.stringify({
                "objectType": data.objectType,
                "content": data.text
            })
        });
    } catch (err) {
        signal.style.color = "orangered";
        alert(err.message);
    }
}


/**
 * @name deleteObjectsFromDB
 * @description delete object from canvas
 */
async function deleteObjectsFromDB(event) {
    const objects = state.canvasInstance[state.activeCanvas.id].getActiveObjects();
    if (!objects.length) {
        alert("Please select objects to delete");
        return;
    }
    const deletePayload = { texts: [], images: [] };
    objects.forEach(obj => {
        deletePayload[getObjectType(obj)].push(obj.id);
    });
    console.log(deletePayload);
    //emit delete object event
    state.socket.emit('delete-objects', { roomId: state.roomId, canvasId: state.activeCanvas.id, payload: deletePayload });
}