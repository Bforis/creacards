import React, { useRef, useState } from 'react';

import './tab.components.css';

import { TabButtons } from './Tab.Components';

function ImageTab(props) {
    //store images
    const images = useRef(props.images);
    //store tabs button details
    const tabs = useRef([
        { id: "publicImages", active: true, name: "Images" },
        { id: "privateImages", active: false, name: "Your Images" },
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

    return <div className='tab'>
        <div className='tab-head'>

            <TabButtons tabs={tabs.current} selectTab={selectTab} />

            {/*-add image module-*/}
            <div className='upload-file' style={{ margin: "auto 10px" }}>
                <input type="file" onChange={props.handleUpload} />
                <span className='fas fa-add'></span>
            </div>

        </div>

        {/*-display images-*/}
        <div className='tab-contents'>
            {images.current[tabs.current[activeTab].id] &&
                images.current[tabs.current[activeTab].id].map((image, index) => {
                    return <div onClick={() => props.selectImage(image)} key={index} className='tab-content'>
                        <img src={image.original} alt={image.title} />
                        {image.premium && <span className='fa fa-star'></span>}
                    </div>
                })
            }
        </div>
    </div>
}

export default ImageTab;