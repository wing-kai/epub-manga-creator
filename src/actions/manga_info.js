import zip from 'jszip'

const ActionType = {
    SAVE_GLOBAL_SETTING: "SAVE_GLOBAL_SETTING",
    SAVE_CONTENTS_SETTING: "SAVE_CONTENTS_SETTING",
    RESET: "RESET"
}

const saveGlobalSetting = (title, creator, subject, language) => ({
    type: ActionType.SAVE_GLOBAL_SETTING,
    title,
    creator,
    subject,
    language
});

const saveContentsSetting = data => ({ type: ActionType.SAVE_CONTENTS_SETTING, data });

const reset = () => ({ type: ActionType.RESET })

export { ActionType }

export default {
    saveGlobalSetting,
    saveContentsSetting,
    reset
}