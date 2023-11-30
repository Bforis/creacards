import React, { useState } from 'react';

const selectStyle = {
    position: "relative",
    width: "fit-content",
    borderRadius: "4px",
    margin: "auto",
    fontSize: "1rem",
    fontFamily: "sans-serif"
}

const labelStyle_1 = {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 1
}

const labelStyle_2 = {
    width: "91%",
    padding: "0 10px",
    whiteSpace: "nowrap",
    color: "white"
}

const dataListStyle = {
    width: "100%",
    padding: "0",
    margin: "0",
    height: "150px",
    overflowY: "scroll",
    overflowX: "hidden",
    listStyle: "none",
    position: 'absolute',
    left: 0,
    top: 35,
    zIndex: 500,
    backgroundColor: "white",
    border: "1px solid #dbdbdb",
    borderRadius: "4px"
}

const listStyle = {
    width: "90%",
    padding: "4px 15px",
    cursor: "pointer",
    whiteSpace: "nowrap"
}

function Select(props) {

    const [list, setList] = useState(false);

    return <div className='select' style={selectStyle} >

        <label id="list-btn" onClick={() => setList(!list)} style={labelStyle_1}></label>

        {/*display selected list*/}
        <label style={labelStyle_2} id={props.selectedValue?.id}>{props.selectedValue?.name} &nbsp; <span className='fa fa-angle-down'></span></label>

        {/**render all list */}
        {list && <ul className="data-list" style={dataListStyle}>
            {props.options.map((option, index) => {
                return <li key={index} style={listStyle} id={option?.id} onClick={() => props.selectValue(option)}>{option?.name}</li>
            })}
        </ul>}

    </div>
}

export default Select;