import React, { useState } from 'react'
import Modal from '../Form/Modal/Modal';

function UploadContentModal(props) {

    const [formdata, setFormData] = useState(new FormData());

    const handleFormInput = (event) => {
        switch (event.target.type) {
            case "checkbox":
                formdata.set(event.target.name, event.target.value === "on");
                break;
            case "file":
                formdata.set(event.target.name, event.target.files[0]);
                break;
            default:
                formdata.set(event.target.name, event.target.value);
                break;
        }
        setFormData(formdata);
    }

    return <Modal heading={props.formInfo.heading} closeModal={props.closeModal}>
        <div className='input'>
            <label>Title</label>
            <input name="title" onChange={handleFormInput} placeholder="Please enter your title" />
        </div>
        <div className='input'>
            <label>Original</label>
            <input name="original" onChange={handleFormInput} type='file' />
        </div>
        <div className='input'>
            <label>Preview</label>
            <input name="preview" onChange={handleFormInput} type='file' />
        </div>
        <div className='input'>
            <label>Premium</label>
            <input name="premium" onChange={handleFormInput} type="checkbox" />
        </div>
        <button onClick={() => props.submitForm(formdata)}>{props.formInfo.btnText}</button>
    </Modal>
}

export default UploadContentModal;