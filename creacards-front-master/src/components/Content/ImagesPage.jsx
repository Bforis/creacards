import axios from 'axios';
import React, { useEffect, useState } from 'react';

import Header from '../Header/Header';
import UploadContentModal from './AddContentModal';
import GridView from './Grid/GridView';
import Content from './Content/Content';

import { imageAPIs } from '../../api';

function ImagesPage() {
    const [modal, setModal] = useState(false);

    const [formInfo, setFormInfo] = useState({});
    const [images, setImages] = useState([]);

    //open form edit and add form modal
    const openModal = ({ heading, btnText }) => {
        setFormInfo({ heading, btnText });
        setModal(true);
    }

    //uploadImage
    const uploadImage = async (data) => {
        try {
            const token = window.localStorage.getItem("token");
            const res = await axios.post(imageAPIs.uploadImage, data, {
                headers: { token },
                validateStatus: () => true
            });
            if (res.data.status !== "success") {
                alert(res.data.message);
                return;
            }
            //update state of images
            setImages([res.data.data.image, ...images]);
        } catch (err) {
            alert(err.message);
        }
        setModal(false);
    }

    //fetch images
    const fetchImages = async () => {
        try {
            const token = window.localStorage.getItem("token");
            const res = await axios.get(imageAPIs.fetchImages, { headers: { token } });
            setImages(res.data.data.images);
        } catch (err) {
            alert(err.message);
        }
    }

    //delete image
    const deleteImage = async (imageId) => {
        try {
            const token = window.localStorage.getItem("token");
            const res = await axios.delete(imageAPIs.deleteImage(imageId), {
                headers: { token },
                validateStatus: () => true
            });
            if (res.data.status !== "success") {
                alert(res.data.message)
                return;
            }
            //remove image from image array
            const filteredImages = images.filter(image => image._id.toString() !== imageId.toString());
            setImages([...filteredImages]);
        } catch (err) {
            alert(err.message);
        }
    }

    useEffect(() => {
        fetchImages();
    }, []);

    return (
        <div>

            <Header headerText={"Manage Images"} back={true}>
                <button style={{ margin: "auto 0" }} className='btn' onClick={() => openModal({ heading: "Add Image", btnText: "add" })}>Add Image</button>
            </Header>

            {/**Display images */}
            <GridView>
                {images.map((image, index) => <Content key={index} deleteContent={deleteImage} content={image} />)}
            </GridView>

            {modal && <UploadContentModal formInfo={formInfo} submitForm={uploadImage} closeModal={() => setModal(false)} />}
        </div>
    );
}

export default ImagesPage;