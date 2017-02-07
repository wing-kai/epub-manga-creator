import entry, { undoable } from "./entry"
import { ActionType } from '../actions/manga_info'

const initialState = {
    global: {
        title: "",
        creator: "",
        subject: "",
        language: ""
    },
    ncxTitle: "目次/Table of Contents",
    contents: [{
        refindex: 1,
        text: "表紙"
    }]
}

const switchType = {
    [ActionType.SAVE_GLOBAL_SETTING]: (state, { title, creator, subject, language }) => {
        state.global = {
            ...state.global,
            title,
            creator,
            subject,
            language
        };

        return state;
    },

    [ActionType.SAVE_CONTENTS_SETTING]: (state, { data }) => {
        state.contents = data;

        return state;
    }
}

export default entry(initialState, switchType);