import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fabric } from 'fabric';
import io from 'socket.io-client';

import './room.css';

import RoomHeader from '../Header/RoomHeader';

import Canvas from './Canvas';
import ContentPanel from './ContentPanel/ContentPanel';

import { fetchRoomReq, createCanvasReq } from './request';

function Room() {

    const token = window.localStorage.getItem("token"); //get token from localstorage
    const { roomId } = useParams(); //get roomId from url

    //these variables cause re-render
    const [loading, setLoading] = useState(false); //prevent api calls if loading true

    const socketRef = useRef({});

    const [contentPanel, toggleContentPanel] = useState(false); //open and close content panel

    const resolutionRef = useRef({ width: 0, height: 0 }); //store dimension of canvas
    const canvasesRef = useRef({}); //store canvases content
    const canvasesFabricRef = useRef({}); //store canvas fabric instances
    const canvasCount = useRef(0); //store total count of canvas
    const [activeCanvas, setActiveCanvas] = useState({}); //store current active canvas

    //send request to create canvas and update canvas state
    const createCanvas = async () => {
        try {
            if (loading) return; //if loading is true prevent request
            setLoading(true);
            const canvas = await createCanvasReq(token, roomId);
            canvasesRef.current[canvas._id?.toString()] = canvas; //store canvas content
            canvasCount.current += 1; //increment canvas count ref
            //activate currently created canvas
            setActiveCanvas({ id: canvas._id?.toString(), name: `C${canvasCount.current}` });
        } catch (err) {
            alert(err.message);
        }
        setLoading(false);
    }

    /**initialize fabric canvas and its contents*/
    const createFabricInstance = (canvasId, data) => {
        if (!canvasId) return;

        const canvasInstance = new fabric.Canvas(canvasId);
        //Set Canvas Dimensions
        canvasInstance.setDimensions(resolutionRef.current);

        //extract id from canvas element
        const id = canvasId?.split('_')[1];
        //get canvas from ref with the help of id
        const canvasContents = canvasesRef.current[id];

        //Load Texts
        canvasContents?.texts?.forEach(textContent => {
            if (!textContent.text) return;
            console.log(`Adding ${textContent.text}`);
            const text = new fabric.Text(textContent.text);
            canvasInstance.add(text);
        });

        //Load Background Image
        if (canvasContents.backgroundImage) {
            const backgroundImage = "https://2xcell.s3.ap-south-1.amazonaws.com//graphics/626c3fca10bc1e6d5c958f91/0e66cebde45da2dd3d0b23300.svg";

            fabric.Image.fromURL(backgroundImage, (image) => {
                canvasInstance.setBackgroundImage(image, canvasInstance.renderAll.bind(canvasInstance), {
                    scaleX: resolutionRef.current.width / image.width,
                    scaleY: resolutionRef.current.height / image.height
                });
            });
        }

        //Load Image
        canvasContents?.images.forEach(img => {
            //add image on canvas
            if (!img?.imageId?.original) return;
            fabric.util.loadImage(img?.imageId?.original, (image) => {
                const lImg = new fabric.Image(image, img.state || {});
                canvasInstance.add(lImg);
            });
        });

        //store fabric canvas instance
        canvasesFabricRef.current[id] = canvasInstance;
    }

    //add text on canvas
    const addTextOnCanvas = () => {
        //update canvas in local state
        const payload = {
            id: Date.now().toString(16),
            text: `Text ${canvasesRef.current[activeCanvas.id].texts.length}`,
            state: {}
        };
        //insert new text in canvas content
        canvasesRef.current[activeCanvas.id].texts.push(payload);
        //add text on canvas
        canvasesFabricRef.current[activeCanvas.id].add(new fabric.Text(payload.text, payload.state));
        //update text on others canvas
        socketRef.current.emit('add-new-text', { roomId, canvasId: activeCanvas.id, payload });
    }

    const addImageOnCanvas = (image) => {
        const payload = {
            id: Date.now().toString(16),
            imageId: {
                _id: image._id,
                original: image.original
            },
            state: {
                scaleX: 0.2,
                scaleY: 0.2
            }
        }
        //insert new text in canvas content
        canvasesRef.current[activeCanvas.id].images.push(payload);
        //add image on canvas
        fabric.util.loadImage(payload.imageId.original, (image) => {
            const lImg = new fabric.Image(image);
            canvasesFabricRef.current[activeCanvas.id].add(lImg);
        });
        //update image on others canvas
        socketRef.current.emit('add-new-image', { roomId, canvasId: activeCanvas.id, payload });
    }

    //copy room link
    const copyLink = () => {
        const linkText = window.location.href;
        window.navigator.clipboard.writeText(linkText)
            .then(() => alert("Text Copied"))
            .catch(() => alert("Failed to copy text!"));
    }

    //load room details when component render first time
    useEffect(() => {
        //initiate socket connection
        socketRef.current = io('https://collaborative-api.herokuapp.com');

        //fetch room details
        fetchRoomReq(token, roomId).then(room => {

            //store canvases in ref
            room.canvases.forEach(canvas => {
                canvasesRef.current[canvas._id.toString()] = canvas;
            });
            //store total canvas count ref
            canvasCount.current = room.canvases.length;
            //store canvas resolution ref
            const canvasEl = document.querySelector('.canvases');
            resolutionRef.current = {
                width: canvasEl.clientWidth,
                height: canvasEl.clientHeight
            }

            //set first canvas in active state
            setActiveCanvas({ id: room.canvases[0]._id?.toString(), name: `C1` });
        }).catch(err => {
            alert(err.message);
        });

        socketRef.current.on('connection', socket => console.log(socket.id));
        socketRef.current.on('new-text', data => console.log(data));
        socketRef.current.on('error', error => alert(error));

    }, [token, roomId]);



    return (
        <div className='room'>
            <RoomHeader
                toggleContentPanel={() => toggleContentPanel(true)}
                options={Object.keys(canvasesRef.current).map((canvas, index) => ({ id: canvasesRef.current[canvas]._id.toString(), name: `C${index + 1}` }))}
                createCanvas={createCanvas}
                changeCanvas={(options) => setActiveCanvas(options)}
                activeCanvas={activeCanvas}
                addText={addTextOnCanvas}
                copyLink={copyLink}
            />
            {/*content panel of editor*/}
            <ContentPanel
                align={"align-left"}
                translate={contentPanel ? "" : "translateLeft"}
                togglePanel={() => toggleContentPanel(false)}
                selectImage={addImageOnCanvas}
            />

            {/**render all canvas */}
            <div className='canvases'>
                {/*
                    <Canvas
                        display={canvasesRef.current[activeCanvas.id]}
                        id={activeCanvas.id}
                        name={activeCanvas.name}
                        createInstance={createFabricInstance}
                    />
                */}
                {Object.keys(canvasesRef.current).map((canvasId, index) => {
                    const canvas = canvasesRef.current[canvasId];
                    return <Canvas
                        key={index}
                        display={canvas._id.toString() === activeCanvas.id}
                        id={canvas._id}
                        name={`Canvas${index + 1} `}
                        createInstance={createFabricInstance}
                    />
                })}
            </div>
        </div>
    );
}

export default Room;