const router = require('express').Router();

const authController = require('../../controllers/authController');
const roomController = require('../../controllers/roomController');
const canvasController = require('../../controllers/canvasController');

/**
 * @description fetch all rooms
 */
router.get('/',
    authController.authorizeRegisteredUser(['admin', 'user']),
    roomController.fetchRooms
);

/**
 * @description create-room
 */
router.get('/create-room',
    authController.authorizeRegisteredUser(['admin', 'user']),
    roomController.createRoom, //create room
    canvasController.createCanvas //create initial canvas of room
);

/**
 * @description fetch room
 */
router.get('/:roomId',
    authController.authorizeRegisteredUser(['admin', 'user', 'guest']),
    roomController.fetchRoom
);

/**
 * @description delete room
 */
router.delete('/:roomId',
    authController.authorizeRegisteredUser(['admin', 'user']),
    roomController.deleteRoom
);

/**
 * @description create canvas in room
 */
router.put('/:roomId/canvases',
    authController.authorizeRegisteredUser(['admin', 'user', 'guest']),
    canvasController.createCanvas //create canvas
);

/**
 * @description delete canvas in room
 */
router.delete('/:roomId/canvases/:canvasId',
    authController.authorizeRegisteredUser(['admin', 'user','guest']),
    canvasController.deleteCanvas
);

/**
 * @description update canvas object state
 */
router.patch('/:roomId/canvases/:canvasId/objects/:objectId',
    authController.authorizeRegisteredUser(['admin', 'user','guest']),
    canvasController.updateCanvasObject
);
/**
 * @description update canvas object state
 */
router.patch('/:roomId/canvases/:canvasId/contents/:objectId',
    authController.authorizeRegisteredUser(['admin', 'user', 'guest']),
    canvasController.updateCanvasContent
);

module.exports = router;