import zip from 'jszip'
import BlobStore from '../blob_store'

const ActionType = {
    IMPORT_PAGES:                 "IMPORT_PAGES",
    SAVE_VIEWPORT_SETTING:        "SAVE_VIEWPORT_SETTING",
    SET_COVER_PAGE:               "SET_COVER_PAGE",
    MOVE_TO_NEXT_PAGE:            "MOVE_TO_NEXT_PAGE",
    MOVE_TO_PREVIOUS_PAGE:        "MOVE_TO_PREVIOUS_PAGE",
    CHANGE_PAGE_INDEX:            "CHANGE_PAGE_INDEX",
    REMOVE_PAGE:                  "REMOVE_PAGE",
    ADD_BLANK_PAGE:               "ADD_BLANK_PAGE",
    CUT_PAGE:                     "CUT_PAGE",

    CHANGE_IMAGE_POSITION:        "CHANGE_IMAGE_POSITION",
    CHANGE_PAGE_BACKGROUND_COLOR: "CHANGE_PAGE_BACKGROUND_COLOR"
}

const transferPageNumber = actionStr => index => ({ type: actionStr, index })

// 导入图片（页面）
const importPages = filesList => {

    const newFileIndexList = BlobStore.importFiles(filesList);

    return {
        type: ActionType.IMPORT_PAGES,
        newFileIndexList
    }
}

const saveViewportSetting = (width, height, position, backgroundColor, direction) => ({
    type: ActionType.SAVE_VIEWPORT_SETTING,
    width,
    height,
    position,
    backgroundColor,
    direction
});

const removePage = transferPageNumber(ActionType.REMOVE_PAGE);

// 设置封面
const setCover = transferPageNumber(ActionType.SET_COVER_PAGE);

const changePageIndex = (originIndex, newIndex) => ({
    type: ActionType.CHANGE_PAGE_INDEX,
    originIndex,
    newIndex
});

// 宽页分割
const cutPage = index => (dispatch, getState) => {

    const blobIndex = getState().present.pageInfo.list[index];
    const mimetype = BlobStore.getBlobObject(blobIndex).type;
    const image = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext('2d');
    const newBlob = [];

    new Promise(resolve => {
        image.onload = resolve
    }).then(e => {
        canvas.width = image.width >> 1;
        canvas.height = image.height;

        ctx.drawImage(image, 0, 0);

        return new Promise(resolve => {
            canvas.toBlob(blob => {
                newBlob.push(blob);
                resolve();
            }, mimetype);
        });
    }).then(() => {
        ctx.drawImage(image, 0 - canvas.width, 0);

        return new Promise(resolve => {
            canvas.toBlob(blob => {
                newBlob.push(blob);
                resolve();
            }, mimetype);
        });
    }).then(() => {
        const newBlobIndex1 = BlobStore.importBlob(newBlob[0]);
        const newBlobIndex2 = BlobStore.importBlob(newBlob[1]);

        dispatch({
            type: ActionType.CUT_PAGE,
            index,
            blobIndex: [newBlobIndex1, newBlobIndex2]
        });
    });

    image.src = BlobStore.getObjectURL(blobIndex);
};

const addBlankPage = (index, color) => dispatch => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 1;
    canvas.height = 1;
    ctx.fillStyle = color === 'white' ? "#fff" : '#000';
    ctx.fillRect(0, 0, 1, 1);
    ctx.beginPath();

    canvas.toBlob(blob => {
        const newBlobIndex = BlobStore.importBlob(blob);

        dispatch({
            type: ActionType.ADD_BLANK_PAGE,
            index,
            newBlobIndex
        });
    }, "image/png");
}

const changeImagePosition = position => ({
    type: ActionType.CHANGE_IMAGE_POSITION,
    position
});

const changeBackgroundColor = color => ({
    type: ActionType.CHANGE_PAGE_BACKGROUND_COLOR,
    color
});

export { ActionType }

export default {
    importPages,
    addBlankPage,
    setCover,
    changePageIndex,
    cutPage,
    removePage,
    saveViewportSetting,

    changeImagePosition,
    changeBackgroundColor
}