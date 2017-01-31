import clone from 'clone'

const reducerEntry = (initialState, switchType) => (
    (state = initialState, action) => {
        if (action.type in switchType) {
            return switchType[action.type](clone(state), action);
        }

        return state;
    }
)

export default reducerEntry;