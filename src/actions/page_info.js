import zip from 'jszip'
import BlobStore from '../blob_store'

const ActionType = {
    IMPORT_PAGES: "IMPORT_PAGES",
    SET_COVER_PAGE: "SET_COVER_PAGE",
    ROTATE: "ROTATE_PAGE",
    MOVE_TO_NEXT_PAGE: "MOVE_TO_NEXT_PAGE",
    MOVE_TO_PREVIOUS_PAGE: "MOVE_TO_PREVIOUS_PAGE",
    CUT_PAGE: "CUT_PAGE"
}

const transferPageNumber = actionStr => 
    num => ({ type: actionStr, pageNum: num })

// 导入图片（页面）
const importPages = filesList => {

    const newFileIndexList = BlobStore.importFiles(filesList);

    return {
        type: ActionType.IMPORT_PAGES,
        newFileIndexList
    }
}

// 设置封面
const setCover = transferPageNumber(ActionType.SET_COVER_PAGE);

// 旋转图片（页面）
const rotatePage = transferPageNumber(ActionType.ROTATE_PAGE);

// 向后调整页码
const moveToNextPage = transferPageNumber(ActionType.MOVE_TO_NEXT_PAGE);

// 向前调整页码
const moveToPreviousPage = transferPageNumber(ActionType.MOVE_TO_PREVIOUS_PAGE);

// 宽页分割
const cutPage = transferPageNumber(ActionType.CUT_PAGE);

export { ActionType }

export default {
    rotatePage,
    importPages,
    setCover,
    moveToNextPage,
    moveToPreviousPage,
    cutPage
}