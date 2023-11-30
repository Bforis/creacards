import React from "react";
import './panel.css';

function Panel(props) {
    return <div className={`panel ${props.translate} ${props.align}`}>
        <div className="head">
            <span className="fa fa-xmark" color="orangered" onClick={props.togglePanel}></span>
        </div>
        {props.children}
    </div>
}

export default Panel;