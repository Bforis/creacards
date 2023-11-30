import React from "react";

import './roomHeader.css';

import Select from '../Form/Input/Select';

function RoomHeader(props) {
    return <div className="room-header">
        <span className="item fa fa-image" onClick={props.toggleContentPanel}></span>
        <span onClick={props.addText} className="item fa fa-edit"></span>
        <span className="item fa fa-plus" onClick={props.createCanvas}></span>
        {/**select canvases*/}
        <Select
            selectedValue={props.activeCanvas}
            selectValue={props.changeCanvas}
            options={props.options}
        />
        <span onClick={props.copyLink} className="item fa fa-share-nodes"></span>
        <span onClick={props.toggleContentPanel} className="item fa fa-save"></span>

    </div>
}

export default RoomHeader;