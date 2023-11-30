//CONTAINS METHODS RELATED TO CONTENT PANEL

//main tab buttons to change it styling
const tabButtons = contentPanel.children[0];
//image and graphics panels in array to access and manipulate elements easily
const tabContents = [
    contentPanel.children[1], //graphic panel is on 2nd index in content panel element
    contentPanel.children[2], //image panel is on 2nd index in content panel element
];

//appends array of contents on screen
function appendContents({ contents, contentType, container }) {
    contents.forEach(content => {
        if (!content.preview && !content.original) return;
        //attach add method to add content on canvas
        const addContent = contentType === "image" ? addImage : addGraphic;

        const tabContent = document.createElement('div');

        tabContent.classList.add('tab-content'); ''
        tabContent.innerHTML = `
        <img src=${content.preview || content.original} alt=${content.title} />
        ${content.premium ? "<span class='fa fa-star'></span>" : ""}
        `;

        const addContentBtn = document.createElement('span');
        addContentBtn.id = `${content._id}`;
        addContentBtn.classList.add('add-content');
        addContentBtn.onclick = addContent;

        tabContent.appendChild(addContentBtn);

        container.appendChild(tabContent);
    });
}

//change tab view
function changeContent(event) {
    if (!event.target.id) return;
    //with the help of id we will get panel from tabContents
    const id = Number.parseInt(event.target.id.split('_')[1]); //split #_3 and get number
    if (!tabContents[id]) return;
    //hide previous active panel and disable tab button
    tabButtons.children[state.contentPanel.panelId].classList.remove('active-btn');
    tabContents[state.contentPanel.panelId].classList.remove('active-tab');
    //display selected panel 
    tabButtons.children[id].classList.add('active-btn');
    tabContents[id].classList.add('active-tab');
    //save new selected panel id
    state.contentPanel.panelId = id;
}


//change inner tab content between public and private
function changeInnerContent(event) {
    if (!event.target.id) return;
    const id = Number.parseInt(event.target.id.split('_')[1]); //split #_3 and get number
    const tabContent = tabContents[state.contentPanel.panelId]; //get active panel
    const contentState = state.contentPanel[tabContent.id] //get active panel content state
    if (!contentState) return;
    const tabButtons = tabContent.children[0].children[0];
    //disable inner active tab button
    tabButtons.children[contentState.panelId].classList.remove('active-btn');
    //clear previous content
    tabContent.children[1].innerHTML = "";
    //active selected inner tab button
    tabButtons.children[id].classList.add('active-btn');
    //append all contents in contents container
    appendContents({
        "contents": contentState[['public', 'private'][id]],
        "contentType": tabContent.id,
        "container": tabContent.children[1]
    });
    //save active inner tab button
    state.contentPanel[tabContent.id].panelId = id;
}

//Load images and graphics data
async function fetchPanelContents(contentURL, contentType, index) {
    const rawResponse = await fetch(contentURL, { method: "GET", headers: { token: state.token } });
    const res = await rawResponse.json();

    if (res.status !== "success") throw res;

    if (!state.contentPanel[contentType]) return;

    if (!res.data[`${contentType}s`]) return;

    //filter public and private contents
    res.data[`${contentType}s`].forEach(content => {
        const visibility = content.owner ? "private" : "public";
        state.contentPanel[contentType][visibility].push(content);
    });

    //append public contents according to content type and index
    appendContents({
        "contents": state.contentPanel[contentType].public,
        "contentType": contentType,
        "container": tabContents[index].children[1]
    });
}

//upload image and graphics
async function uploadContent(event) {
    try {

        const contentType = event.target.name; //content = graphic type or image type
        const contentInfo = {
            "graphic": { "api": graphicAPIs.uploadGraphic, "index": 0 }, //store api and tab index position
            "image": { "api": imageAPIs.uploadImage, "index": 1 }
        }[contentType];

        if (!contentInfo) return; ///return if no api found for selected content

        const formdata = new FormData();
        formdata.set('original', event.target.files[0]); //append uploaded file in formdata
        //send request to upload file
        const rawResponse = await fetch(contentInfo.api, { method: "POST", body: formdata, headers: { token: state.token } });
        const res = await rawResponse.json();

        if (res.status !== "success") throw res;

        if (!state.contentPanel[contentType]) return;

        //push uploaded content private array of selected content
        state.contentPanel[contentType]["private"].push(res.data[contentType]);

        //display content on screen if tab is open
        const isSelectedPanelOpen = state.contentPanel.panelId === contentInfo.index;
        const isPrivatePanelOpen = state.contentPanel[contentType].panelId === 1
        if (isSelectedPanelOpen && isPrivatePanelOpen) {
            appendContents({
                "contents": [res.data[contentType]],
                "contentType": contentType,
                "container": tabContents[contentInfo.index].children[1]
            });
        }

    } catch (err) {
        alert(err.message);
    }
}