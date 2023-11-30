//build complete api by taking origin and resource path
const origin = "https://collaborative-api.herokuapp.com";
//const origin = "http://127.0.0.1:5000";
const createAPI = (path) => {
    return `${origin}/api/v1/${path}`;
}

export const roomOrigin = origin;

export const userAPIs = {
    "signup": createAPI("users/signup"),
    "login": createAPI("users/login"),
    "verify": createAPI("users/verify"),
    "getUser": createAPI("users/profile"),
}

export const planAPIs = {
    "fetchPlans": createAPI("plans"),
    "checkoutPlan": (planId) => createAPI(`plans/${planId}/checkout-session`)
}

export const roomAPIs = {
    "createRoom": createAPI("rooms/create-room"),
    "fetchRooms": createAPI("rooms"),
    "fetchRoom": (roomId) => createAPI(`rooms/${roomId}`),
    "deleteRoom": (roomId) => createAPI(`rooms/${roomId}`),
    "createCanvas": (roomId) => createAPI(`rooms/${roomId}/canvases`),
    "deleteCanvas": (roomId, canvasId) => createAPI(`rooms/${roomId}/canvases/${canvasId}`),
}

export const imageAPIs = {
    "uploadImage": createAPI("images"),
    "fetchImages": createAPI("images"),
    "deleteImage": (imageId) => createAPI(`images/${imageId}`)
}

export const graphicAPIs = {
    "uploadGraphic": createAPI("graphics"),
    "fetchGraphics": createAPI("graphics"),
    "deleteGraphic": (graphicId) => createAPI(`graphics/${graphicId}`)
}