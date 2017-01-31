import zip from 'jszip'

const ActionType = {
    SAVE_GLOBAL_SETTING: "SAVE_GLOBAL_SETTING",
    SAVE_NCX_SETTING: "SAVE_NCX_SETTING",
    UPDATE_UUID: "UPDATE_UUID"
}

const saveGlobalSetting = data => ({ type: ActionType.SAVE_GLOBAL_SETTING, data });

const updateUUID = () => ({ type: ActionType.UPDATE_UUID });

export { ActionType }

export default {
    updateUUID,
    saveGlobalSetting
}