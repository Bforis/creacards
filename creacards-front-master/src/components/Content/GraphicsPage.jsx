import axios from 'axios';
import React, { useEffect, useState } from 'react';

import Header from '../Header/Header';
import UploadContentModal from './AddContentModal';
import GridView from './Grid/GridView';
import Content from './Content/Content';

import { graphicAPIs } from '../../api';

function GraphicsPage() {
    const [modal, setModal] = useState(false);

    const [formInfo, setFormInfo] = useState({});
    const [graphics, setGraphics] = useState([]);

    //open form edit and add form modal
    const openModal = ({ heading, btnText }) => {
        setFormInfo({ heading, btnText });
        setModal(true);
    }

    //upload graphic
    const uploadGraphic = async (data) => {
        try {
            const token = window.localStorage.getItem("token");
            const res = await axios.post(graphicAPIs.uploadGraphic, data, {
                headers: { token },
                validateStatus: () => true
            });
            if (res.data.status !== "success") {
                alert(res.data.message);
                return;
            }
            //update state of images
            setGraphics([res.data.data.graphic, ...graphics]);
        } catch (err) {
            alert(err.message);
        }
        setModal(false);
    }

    //fetch graphics
    const fetchGraphics = async () => {
        try {
            const token = window.localStorage.getItem("token");
            const res = await axios.get(graphicAPIs.fetchGraphics, { headers: { token } });
            setGraphics(res.data.data.graphics);
        } catch (err) {
            alert(err.message);
        }
    }

    //delete graphic
    const deleteGraphic = async (graphicId) => {
        try {
            const token = window.localStorage.getItem("token");
            const res = await axios.delete(graphicAPIs.deleteGraphic(graphicId), {
                headers: { token },
                validateStatus: () => true
            });
            if (res.data.status !== "success") {
                alert(res.data.message)
                return;
            }
            //remove image from image array
            const filteredGraphics = graphics.filter(graphic => graphic._id.toString() !== graphicId.toString());
            setGraphics([...filteredGraphics]);
        } catch (err) {
            alert(err.message);
        }
    }

    useEffect(() => {
        fetchGraphics();
    }, []);

    return (
        <div>
            <Header headerText={"Manage Graphics"} back={true}>
                <button style={{ margin: "auto 0" }} onClick={() => openModal({ heading: "Add Graphic", btnText: "add" })}>Add Graphic</button>
            </Header>

            {/**Display graphics */}
            <GridView>
                {graphics.map((graphic, index) => <Content id={index} deleteContent={deleteGraphic} content={graphic} />)}
                {/*graphics.map((graphic, id) => {
                    return (
                        <div key={id} className='imgContainer'>
                            <div className='func'>
                                <div>
                                    <button className='btn' onClick={() => deleteGraphic(graphic._id)} style={{ backgroundColor: "red" }}>Delete</button>
                                </div>
                            </div>
                            <img src={graphic.preview || graphic.original} />
                            <p>{graphic.title}</p>
                        </div>
                    );
                })
            */}
            </GridView>

            {/*Content Upload Modal*/}
            {modal && <UploadContentModal
                formInfo={formInfo}
                submitForm={uploadGraphic}
                closeModal={() => setModal(false)}
            />}

        </div>
    );
}

export default GraphicsPage;