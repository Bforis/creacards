import React, { useRef, useState } from 'react';

import './tab.components.css';

import { TabButtons } from './Tab.Components';

function GraphicTab(props) {
    //store graphics
    const graphics = useRef(props.graphics);
    //store tabs button details
    const tabs = useRef([
        { id: "publicGraphics", active: true, name: "Graphics" },
        { id: "privateGraphics", active: false, name: "Your Graphics" },
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

            <div className='upload-file' style={{ margin: "auto 10px" }}>
                <input type="file" onChange={props.handleUpload} accept="image/svg+xml" />
                <span className='fas fa-add'></span>
            </div>

        </div>
        <div className='tab-contents'>
            {graphics.current[tabs.current[activeTab].id] &&
                graphics.current[tabs.current[activeTab].id].map((graphic, index) => {
                    return <div key={index} className='tab-content'>
                        <img src={graphic.original} alt={graphic.title} />
                        {graphic.premium && <span className='fa fa-star'></span>}
                    </div>
                })
            }
        </div>
    </div>
}

export default GraphicTab;