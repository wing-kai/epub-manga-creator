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

    [ActionType.SET_COVER_PAGE]: (state, { index }) => {
        const coverBlobIndex = state.list.splice(index, 1);

        state.list.unshift(coverBlobIndex);

        return state;
    },

    [ActionType.REMOVE_PAGE]: (state, { index }) => {
        const blobIndex = state.list.splice(index, 1);
        BlobStore.removeBlob(blobIndex);
        return state;
    },

    [ActionType.MOVE_TO_NEXT_PAGE]: (state, { index }) => {
        const nextIndex = index + 1 === state.list.length ? index : index + 1;
        const bi1 = state.list[index];
        const bi2 = state.list[nextIndex];

        state.list[index] = bi2;
        state.list[nextIndex] = bi1;

        return state;
    },

    [ActionType.MOVE_TO_PREVIOUS_PAGE]: (state, { index }) => {
        const previousIndex = index - 1 < 0 ? 0 : index - 1;
        const bi1 = state.list[index];
        const bi2 = state.list[previousIndex];

        state.list[index] = bi2;
        state.list[previousIndex] = bi1;

        return state;
    },

    [ActionType.CHANGE_PAGE_INDEX]: (state, { originIndex, newIndex }) => {
        const bi1 = state.list[originIndex];
        const bi2 = state.list[newIndex];

        if (originIndex < newIndex) {
            state.list.splice(newIndex, 1, bi2, bi1);
            state.list.splice(originIndex, 1);
        }

        if (originIndex > newIndex) {
            state.list.splice(originIndex, 1);
            state.list.splice(newIndex, 1, bi1, bi2);
        }

        return state;
    },

    [ActionType.CUT_PAGE]: (state, { index, newBlobIndex }) => {
        const blobIndex = state.list[index];
        state.list.splice(index, 1, newBlobIndex, blobIndex);
        return state;
    },

    [ActionType.ADD_BLANK_PAGE]: (state, { index, newBlobIndex }) => {
        const blobIndex = state.list[index];
        state.list.splice(index, 1, newBlobIndex, blobIndex);
        return state;
    },

    [ActionType.SAVE_VIEWPORT_SETTING]: (state, { data }) => {
        state.viewport = data;

        return state;
    }
}

export default entry(initialState, switchType)