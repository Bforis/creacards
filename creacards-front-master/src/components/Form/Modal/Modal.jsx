import React from "react";
import './modal.css';

function Modal(props) {

    return (<div className="modal-wrapper">
        <div className="modal-form">
            <div className="form-head">
                <h3>{props.heading}</h3>
                <span onClick={props.closeModal}>close</span>
            </div>
            <div className="form-body">
                {props.children}
            </div>
        </div>
    </div>);
}

export default Modal;