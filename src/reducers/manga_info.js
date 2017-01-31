import entry from "./entry"
import { ActionType } from '../actions/manga_info'

const generateRandomUUID = () => {
    const char = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    let uuid = "";
    let i = 36;

    while (i-- > 0) {
        if (i === 27 || i === 22 || i === 17 || i === 12) {
            uuid = uuid + "-";
        } else {
            uuid = uuid + String(char[Math.ceil(Math.random() * 35)])
        }
    }

    return uuid;
}

const initialState = {
    global: {
        uuid: generateRandomUUID(),
        title: "",
        creator: "",
        subject: "",
        language: ""
    },
    ncxTitle: "目次/Table of Contents",
    ncx: [{
        pageNum: 1,
        text: "表紙"
    }]
}

const switchType = {
    [ActionType.UPDATE_UUID]: (state) => {
        state.global.uuid = generateRandomUUID();

        return state;
    },

    [ActionType.SAVE_GLOBAL_SETTING]: (state, { data }) => {
        state.global = data;

        return state;
    },

    [ActionType.SAVE_NCX_SETTING]: (state, { data }) => {
        state.ncx = data;

        return state;
    }
}

export default entry(initialState, switchType)