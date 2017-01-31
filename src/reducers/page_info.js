import entry from "./entry"
import { ActionType } from '../actions/page_info'
import BlobStore from '../blob_store'

const initialState = {
    firstBlankPage: true, // 首页留白
    viewport: {
        height: 1500,
        width: 1058
    },
    list: []
}

const switchType = {
    [ActionType.IMPORT_PAGES]: (state, { newFileIndexList }) => {
        state.list = [...state.list, ...newFileIndexList];
        return state;
    },

    [ActionType.SET_COVER_PAGE]: (state, { num }) => {
        return state;
    },

    [ActionType.ROTATE_PAGE]: (state, { num }) => {
        return state;
    }
}

export default entry(initialState, switchType)