import React from 'react';
import { createRoot } from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import 'components/icon'
import './index.css'

import Header from 'components/header'
import Main from 'components/main'
import Modal, { ModalBackDrop } from 'components/modal'

const App = () => (
  <>
    <Header />
    <Main />
    <Modal />
    <ModalBackDrop />
  </>
);

const container = document.getElementById('root') || document.body.appendChild(document.createElement('div'));
if (!container.id) container.id = 'root';
const root = createRoot(container);
root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
