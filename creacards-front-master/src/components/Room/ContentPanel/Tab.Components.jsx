import React from 'react';

import './tab.components.css';

export function TabButton(props) {
    return <span onClick={props.selectTab} style={{ color: props.tab.active && "black" }} id={props.tab.id}>{props.tab.name}</span>
}

export function TabButtons(props) {
    return <div className='tabs-button'>
        {props.tabs.map((tab, index) => <TabButton key={index} tab={tab} selectTab={props.selectTab} />)}
    </div>
}
