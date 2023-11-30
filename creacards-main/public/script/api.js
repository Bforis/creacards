//build complete api by taking origin and resource path

const createAPI = (path) => {
    //server origin
    const origin = `${window.location.origin}/api/v1`;
    return `${origin}/${path}`;
}

const roomAPIs = {
    "fetchRoom": (roomId) => createAPI(`rooms/${roomId}`),
    "createCanvas": (roomId) => createAPI(`rooms/${roomId}/canvases`),
    "deleteCanvas": (roomId, canvasId) => createAPI(`rooms/${roomId}/canvases/${canvasId}`),
    //update canvas object update the state of object
    "updateCanvasObject": (roomId, canvasId, objectId) => createAPI(`rooms/${roomId}/canvases/${canvasId}/objects/${objectId}`),
    //update canvas object updatde the main content of object
    "updateCanvasContent": (roomId, canvasId, objectId) => createAPI(`rooms/${roomId}/canvases/${canvasId}/contents/${objectId}`)
}

const imageAPIs = {
    "uploadImage": createAPI("images"),
    "fetchImages": createAPI("images"),
    "deleteImage": (imageId) => createAPI(`images/${imageId}`)
}

const graphicAPIs = {
    "uploadGraphic": createAPI("graphics"),
    "fetchGraphics": createAPI("graphics"),
    "deleteGraphic": (graphicId) => createAPI(`graphics/${graphicId}`)
}
