import zip from 'jszip'

const ActionType = {
    SAVE_GLOBAL_SETTING: "SAVE_GLOBAL_SETTING",
    SAVE_CONTENTS_SETTING: "SAVE_CONTENTS_SETTING",
    UPDATE_UUID: "UPDATE_UUID"
}

const saveGlobalSetting = data => ({ type: ActionType.SAVE_GLOBAL_SETTING, data });

const saveContentsSetting = data => ({ type: ActionType.SAVE_CONTENTS_SETTING, data });

const updateUUID = () => ({ type: ActionType.UPDATE_UUID });

export { ActionType }

export default {
    updateUUID,
    saveGlobalSetting,
    saveContentsSetting
}