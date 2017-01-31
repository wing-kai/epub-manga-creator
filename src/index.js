import React from 'react'
import ReactDOM, { render } from 'react-dom'
import { Provider } from 'react-redux'

import Store from './configureStore'
import Container from './components'

const Body = document.getElementById("body");

const App = (
    <Provider store={Store}>
        <Container />
    </Provider>
);

ReactDOM.render(App, Body);