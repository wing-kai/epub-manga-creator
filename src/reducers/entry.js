import clone from 'clone'
import deepEqual from 'deep-equal'
import BlobStore from '../blob_store'

const maxLength = 10;

const undoable = reducer => {
    const initialState = {
        past: [],
        present: reducer(undefined, {}),
        future: []
    };

    return ({ past = initialState.past, present = initialState.present, future = initialState.future, }, action) => {
        const state = { past, present, future };

        if (action.type === "RESET") {
            BlobStore.removeAllBlob();
            window.onbeforeunload = undefined;
            return clone(initialState);
        }

        if (action.type === "UNDO") {
            if (past.length === 0)
                return state;

            const previous = past[past.length - 1];
            const newPast = past.slice(0, past.length - 1);
            const newFuture = future.length === maxLength ? [...future.slice(1), present] : [...future, present];

            return clone({
                past: newPast,
                present: previous,
                future: newFuture
            });
        }

        if (action.type === "REDO") {
            if (future.length === 0)
                return state;

            const newPresent = future.pop();
            const newPast = [...past, present];

            return clone({
                past: newPast,
                present: newPresent,
                future: future
            });
        }

        const newPresent = reducer(present, action);

        if (deepEqual(newPresent, present, { strict: true })) {
            return state;
        } else {
            let newPast = [...past, clone(present)];
            newPast = newPast.length > maxLength ? newPast.slice(1) : newPast;
            window.onbeforeunload = e => confirm("确定退出吗？");

            return {
                past: newPast,
                present: newPresent,
                future: []
            }
        }
    }
}

const reducerEntry = (initialState, switchType) => (
    (state = initialState, action) => {
        if (action.type in switchType) {
            return switchType[action.type](clone(state), action);
        }

        return state;
    }
)

export { undoable }

export default reducerEntry;