import React, { useMemo } from 'react';
import './canvas.css';

function Canvas(props) {

    //create instance of canvas
    useMemo(() => {
        if (!props.id) return;
        console.log(`Rendering component ${props.name}`);
        props.createInstance(`id_${props.id}`, {});
    }, [props]);

    return props.id && <div className='canvas-wrapper' style={{ display: props.display ? 'block' : 'none' }}>
        <canvas id={`id_${props.id}`} />
    </div>
}

export default Canvas;