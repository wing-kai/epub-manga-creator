import { combineReducers } from 'redux'

import pageInfo from './page_info'
import mangaInfo from './manga_info'

const rootReducer = combineReducers({
    pageInfo,
    mangaInfo
});

export default rootReducer;