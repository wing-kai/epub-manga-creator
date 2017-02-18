import zip from 'jszip'

const ActionType = {
    SAVE_BOOKINFO: "SAVE_BOOKINFO",
    ADD_CREATOR: "ADD_CREATOR",
    REMOVE_CREATOR: "REMOVE_CREATOR",
    SAVE_CONTENTS_SETTING: "SAVE_CONTENTS_SETTING",
    RESET: "RESET"
}

const saveBookInfo = (id, title, creator, subject, publisher) => ({
    type: ActionType.SAVE_BOOKINFO,
    bookInfo: {
        id,
        title,
        creator,
        subject,
        publisher
    }
});

const addCreator = index => ({ type: ActionType.ADD_CREATOR, index });

const removeCreator = index => ({ type: ActionType.REMOVE_CREATOR, index });

const saveContentsSetting = data => ({ type: ActionType.SAVE_CONTENTS_SETTING, data });

const reset = () => ({ type: ActionType.RESET });

export { ActionType }

export default {
    saveBookInfo,
    addCreator,
    removeCreator,
    saveContentsSetting,
    reset
}