import { combineReducers } from 'redux'

import pageInfo from './page_info'
import mangaInfo from './manga_info'
import { undoable } from './entry'

const stackLength = 10;

const rootReducer = undoable(combineReducers({
    pageInfo,
    mangaInfo
}));

export default rootReducer;