import React from 'react';
import './content.css';

function Content(props) {
    return <div className='content-wrapper'>
        {/**main content */}
        <div className='content'>
            <p>{props?.content?.title}</p>
            <img src={props?.content?.original || props?.content?.preview} alt={props?.content?.title} />
        </div>
        {/**content action */}
        <div className='options'>
            <span>{props.content.premium ? "Free" : "Premium"}</span>
            <span onClick={() => props.deleteContent(props.content?._id)} className='fa fa-trash delete'></span>
        </div>
    </div>
}

export default Content;