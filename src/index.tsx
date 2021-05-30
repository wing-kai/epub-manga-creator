import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import 'components/icon'
import './index.css'

import Header from 'components/header'
import Main from 'components/main'
import Modal, { ModalBackDrop } from 'components/modal'

function renderComponent(reactComponent: React.ReactElement) {
  const container = document.createElement('div')
  const Portal = () => {
    return ReactDOM.createPortal(reactComponent, document.body)
  }
  ReactDOM.render(<Portal/>, container)
}

renderComponent(<Header />)
renderComponent(<Main />)
renderComponent(<Modal />)
renderComponent(<ModalBackDrop />)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
