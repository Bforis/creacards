import React, { useEffect, useRef, useState } from 'react';
import Panel from '../Panel/Panel';

import { TabButtons } from './Tab.Components';
import ImageTab from './ImageTab';
import GraphicTab from './GraphicTab';

import { imageAPIs, graphicAPIs } from '../../../api';
import axios from 'axios';

function ContentPanel(props) {

    const token = window.localStorage.getItem("token");
    //store images
    const [images, setImages] = useState({
        publicImages: [],
        privateImages: []
    });
    //store graphics
    const [graphics, setGraphics] = useState({
        publicGraphics: [],
        privateGraphics: []
    });
    //store tabs button details
    const tabs = useRef([
        { id: "graphics", active: true, name: "Graphics" },
        { id: "images", active: false, name: "Images" },
        { id: "gifs", active: false, name: "Gifs" },
    ]);
    //store current active tab
    const [activeTab, setActiveTab] = useState(0);

    //disable current tab and enable selectedd tab
    const selectTab = function (e) {
        const id = e.target.id;
        if (!id) return;

        //find index of selectedTab
        const tabIndex = tabs.current.findIndex(tab => tab.id === id);
        if (activeTab === tabIndex) return;
        //disable current active tab
        tabs.current[activeTab].active = false;
        //enable select tab
        tabs.current[tabIndex].active = true;
        //update tab state
        setActiveTab(tabIndex);
    }

    //render current active tab
    const displayActiveTab = function (activeTab) {
        var comp = null
        switch (activeTab) {
            case 0:
                comp = <GraphicTab graphics={graphics} handleUpload={uploadGraphics} />
                break;
            case 1:
                comp = <ImageTab images={images} handleUpload={uploadImages} selectImage={props.selectImage} />
                break;
            default:
                comp = <></>;
                break;
        }
        return comp;
    }


    //upload graphics
    const uploadGraphics = async (e) => {
        const formdata = new FormData();
        formdata.set('original', e.target.files[0]);
        const res = await axios.post(graphicAPIs.uploadGraphic, formdata, {
            headers: { token },
            validateStatus: () => true
        });

        if (res.data.status !== "success") {
            alert(res.data.message);
            return;
        }

        //update graphics
        graphics.privateGraphics.push(res.data.data.graphic);
        setGraphics({ ...graphics });
    }

    //upload images
    const uploadImages = async (e) => {
        const formdata = new FormData();
        formdata.set('original', e.target.files[0]);
        const res = await axios.post(imageAPIs.uploadImage, formdata, {
            headers: { token },
            validateStatus: () => true
        });

        if (res.data.status !== "success") {
            alert(res.data.message);
            return;
        }

        //update images
        images.privateImages.push(res.data.data.image);
        setImages({ ...images });
    }

    //fetch images and graphics
    useEffect(() => {

        //fetch images
        axios.get(imageAPIs.fetchImages, {
            headers: { token }, validateStatus: () => true
        }).then(res => {
            if (res.data.status !== "success") {
                alert(res.data.message);
                return;
            }
            //filter public and private images
            const state = {
                private: [],
                public: []
            }
            res.data.data.images.forEach(image => {
                if (image.owner) state.private.push(image);
                else state.public.push(image);
            });
            //update state
            setImages({ privateImages: state.private, publicImages: state.public });
        }).catch(err => alert(err.message));

        //fetch graphics
        axios.get(graphicAPIs.fetchGraphics, {
            headers: { token }, validateStatus: () => true
        }).then(res => {
            if (res.data.status !== "success") {
                alert(res.data.message);
                return;
            }
            //filter public and private grahics
            const state = {
                private: [],
                public: []
            }
            res.data.data.graphics.forEach(graphic => {
                if (graphic.owner) state.private.push(graphic);
                else state.public.push(graphic);
            });
            //update state
            setGraphics({ privateGraphics: state.private, publicGraphics: state.public });

        }).catch(err => alert(err.message));

    }, [token]);

    return <Panel align={props.align} translate={props.translate} togglePanel={props.togglePanel}>

        {/**display tabs to select */}
        <TabButtons tabs={tabs.current} selectTab={selectTab} />

        {/**display select tab*/}
        {displayActiveTab(activeTab)}

    </Panel>
}

export default ContentPanel;