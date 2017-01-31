import zip from 'jszip'
import BlobStore from '../blob_store'

const ActionType = {
    IMPORT_PAGES: "IMPORT_PAGES",
    SAVE_VIEWPORT_SETTING: "SAVE_VIEWPORT_SETTING",
    SET_COVER_PAGE: "SET_COVER_PAGE",
    ROTATE: "ROTATE_PAGE",
    MOVE_TO_NEXT_PAGE: "MOVE_TO_NEXT_PAGE",
    MOVE_TO_PREVIOUS_PAGE: "MOVE_TO_PREVIOUS_PAGE",
    CHANGE_PAGE_INDEX: "CHANGE_PAGE_INDEX",
    "REMOVE_PAGE": "REMOVE_PAGE",
    CUT_PAGE: "CUT_PAGE"
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

const saveViewportSetting = data => ({ type: ActionType.SAVE_VIEWPORT_SETTING, data });

const removePage = transferPageNumber(ActionType.REMOVE_PAGE);

// 设置封面
const setCover = transferPageNumber(ActionType.SET_COVER_PAGE);

// 旋转图片（页面）
const rotatePage = transferPageNumber(ActionType.ROTATE_PAGE);

// 向后调整页码
const moveToNextPage = transferPageNumber(ActionType.MOVE_TO_NEXT_PAGE);

// 向前调整页码
const moveToPreviousPage = transferPageNumber(ActionType.MOVE_TO_PREVIOUS_PAGE);

const changePageIndex = (originIndex, newIndex) => ({
    type: ActionType.CHANGE_PAGE_INDEX,
    originIndex,
    newIndex
});

// 宽页分割
const cutPage = transferPageNumber(ActionType.CUT_PAGE);

export { ActionType }

export default {
    rotatePage,
    importPages,
    setCover,
    moveToNextPage,
    moveToPreviousPage,
    changePageIndex,
    cutPage,
    removePage,
    saveViewportSetting
}