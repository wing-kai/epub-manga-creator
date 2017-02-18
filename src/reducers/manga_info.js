import entry, { undoable } from "./entry"
import { ActionType } from '../actions/manga_info'

const initialState = {
    bookInfo: {
        id: "",
        title: "",
        creator: [""],
        subject: "",
        publisher: ""
    },
    ncxTitle: "目次/Table of Contents",
    contents: [{
        refindex: 1,
        text: "表紙"
    }]
}

const switchType = {
    [ActionType.SAVE_BOOKINFO]: (state, { bookInfo }) => {
        state.bookInfo = bookInfo;
        return state;
    },

    [ActionType.ADD_CREATOR]: (state, { index }) => {
        const c = state.bookInfo.creator[index];
        state.bookInfo.creator.splice(index, 1, c, '');
        return state;
    },

    [ActionType.REMOVE_CREATOR]: (state, { index }) => {
        state.bookInfo.creator.splice(index, 1);
        return state;
    },

    [ActionType.SAVE_CONTENTS_SETTING]: (state, { data }) => {
        state.contents = data;

        return state;
    }
}

export default entry(initialState, switchType);