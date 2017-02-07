const ActionType = {
    UNDO: "UNDO",
    REDO: "REDO"
}

const undo = () => ({ type: ActionType.UNDO });
const redo = () => ({ type: ActionType.REDO });

export { ActionType }

export default {
    undo,
    redo
}