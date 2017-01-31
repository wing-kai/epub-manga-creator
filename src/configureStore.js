import { compose, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

const initialState = {};

const createStoreWithMiddleware = compose(
    applyMiddleware(thunk),
    window.devToolsExtension ? window.devToolsExtension({
      serialize: (key, value) => {
        if (typeof(value) === 'Symbol')
            return String(value);

        return value;
      }
    }) : f => f
)(createStore)

const Store = createStoreWithMiddleware(rootReducer, initialState);

export default Store