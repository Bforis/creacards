import React from 'react';
import './gridview.css';
//import Pagination from "react-js-pagination";

function GridView(props) {
    /*
    handle pagination here
    const [activePage, setActivePage] = useState(1);
    const handleChange = (num) => {
        setActivePage(num);
    }*/
    return (
        <>
            {/** 
            <Pagination
                activePage={activePage}
                itemsCountPerPage={20}
                totalItemsCount={props.data.length}
                pageRangeDisplayed={5}
                onChange={handleChange}
            />
            */}
            <div className='gallery'>
                {props.children}
            </div>
        </>
    )
}

export default GridView