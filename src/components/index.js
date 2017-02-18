import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import clone from 'clone'

import ActionCreators from '../actions'
import BlobStore from '../blob_store'
import GenerateEPUB from '../generate_epub'

import WorkSpace from './workspace'
import Modal, { ModalName } from './modal'
import { Button, Icon, Row } from './common'

const STATUS = {
    READY: 'READY',
    WORKING: 'WORKING'
}

class ControlBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            generateStatus: STATUS.READY
        }

        this.handleGetFile           = this.handleGetFile.bind(this);
        this.handleClickAddBlankPage = this.handleClickAddBlankPage.bind(this);
        this.handleClickResetButton  = this.handleClickResetButton.bind(this);
        this.handleClickGenerateButton = this.handleClickGenerateButton.bind(this);
    }

    render() {
        const component                = this;
        const { State, Action }        = component.props;
        const { handleClickShowModal } = component.props;
        const { generateStatus }       = component.state;
        let downloadDisable            = false;

        if (State.pageInfo.list.length === 0 || generateStatus === STATUS.WORKING) {
            downloadDisable = true;
        }

        return (
            <nav className="navbar sticky-top navbar-inverse bg-inverse bg-faded">
                <div className="container">
                    <Button color="secondary" onClick={this.handleClickImportButton}>
                        <Icon name="folder-open" fw="true" />
                    </Button>
                    <input
                        id="input-upload"
                        type="file"
                        value=""
                        accept="image/jpeg,image/png"
                        multiple="multiple"
                        onChange={this.handleGetFile}
                        style={{display:"none"}}
                    />
                    &nbsp;&nbsp;
                    <div className="btn-toolbar" style={{display:"inline-block"}}>
                        <div className="btn-group">
                            <Button
                                color="secondary"
                                data-modal-name={ModalName.BookInfo}
                                onClick={handleClickShowModal}
                            >
                                <Icon name="book" fw="true" />
                            </Button>
                            <Button
                                color="secondary"
                                data-modal-name={ModalName.ContentTable}
                                onClick={handleClickShowModal}
                            >
                                <Icon name="list" fw="true" />
                            </Button>
                            <Button
                                color="secondary"
                                data-modal-name={ModalName.Viewport}
                                onClick={handleClickShowModal}
                            >
                                <Icon name="eye" fw="true" />
                            </Button>
                        </div>
                    </div>
                    &nbsp;&nbsp;
                    <div className="btn-toolbar" style={{display:"inline-block"}}>
                        <div className="btn-group">
                            <Button
                                color="secondary"
                                data-color="white"
                                onClick={this.handleClickAddBlankPage}
                            >
                                <Icon name="square-o" fw="true" />
                            </Button>
                            <Button
                                color="secondary"
                                data-color="black"
                                onClick={this.handleClickAddBlankPage}
                            >
                                <Icon name="square" fw="true" />
                            </Button>
                        </div>
                    </div>
                    &nbsp;&nbsp;
                    <div className="btn-toolbar" style={{display:"inline-block"}}>
                        <div className="btn-group">
                            <Button
                                color="secondary"
                                {...State.undoable ? {onClick: Action.undo} : {disabled: true}}
                            >
                                <Icon fw="true" name="undo" />
                            </Button>
                            <Button
                                color="secondary"
                                {...State.redoable ? {onClick: Action.redo} : {disabled: true}}
                            >
                                <Icon fw="true" name="rotate-right" />
                            </Button>
                        </div>
                    </div>
                    &nbsp;&nbsp;
                    <Button color="secondary" onClick={this.handleClickResetButton}>
                        <Icon fw="true" name="circle" />
                    </Button>
                    <Button color="secondary" style={{float:'right'}} {...downloadDisable ? {disabled: true} : {onClick: this.handleClickGenerateButton}}>
                        {
                            generateStatus === STATUS.WORKING
                            ? <span className="fa fa-spinner fa-pulse" />
                            : <Icon fw="true" name="download" />
                        }
                    </Button>
                </div>
            </nav>
        );
    }

    handleClickImportButton() {
        document.getElementById('input-upload').click();
    }

    handleGetFile(e) {
        const input = e.currentTarget;
        const { Action } = this.props;
        const component  = this;

        const filesList = [...input.files].filter(fileObj => input.accept.indexOf(fileObj.type) > -1);

        if (filesList.length)
            Action.importPages(filesList);
    }

    handleClickGenerateButton(e) {
        const component = this;

        new Promise(resolve => component.setState({
            generateStatus: STATUS.WORKING
        }, resolve)).then(() => {
            return GenerateEPUB(component.props.State)
        }).then(() => {
            component.setState({
                generateStatus: STATUS.READY
            });
        }).catch(err => {
            component.setState({
                generateStatus: STATUS.READY
            });
        });
    }

    handleClickAddBlankPage(e) {
        const targetIndex = Number(prompt("index: (number only)"));
        const { color } = e.currentTarget.dataset;

        if (!isNaN(targetIndex) && targetIndex > 0)
            this.props.Action.addBlankPage(targetIndex - 1, color);
    }

    handleClickResetButton(e) {
        const needReset = window.confirm('确认重置工作区？（无法撤销）');

        if (needReset)
            this.props.Action.reset();
    }
}

class Main extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showModal: ModalName.None
        }

        this.handleShowModal = this.handleShowModal.bind(this);
        this.handleHideModal = this.handleHideModal.bind(this);
    }

    render() {
        const { State, Action } = this.props;

        return (
            <div style={{width: '100%', height: '100%'}}>
                <ControlBar
                    State={State}
                    Action={Action}
                    handleClickShowModal={this.handleShowModal}
                />
                <div className="container" style={{marginTop: 20}}>
                    {
                        State.pageInfo.list.length > 0
                        ? <WorkSpace State={State} Action={Action} />
                        : (
                            <div className="jumbotron">
                                <div className="display-3 text-center">
                                    <Button color="secondary" onClick={this.handleClickImportButton}>
                                        <br/>
                                        <span className="fa fa-fw fa-folder-open fa-5x"></span>
                                        <br/>
                                        <br/>
                                        <h3>&nbsp;导&nbsp;入&nbsp;图&nbsp;片&nbsp;</h3>
                                    </Button>
                                </div>
                            </div>
                        )
                    }
                    <hr/>
                    <div className="row" style={{marginBottom:20}}>
                        <div className="col d-flex align-items-center justify-content-start">
                            © 2017 wing-kai@Github</div>
                        <div className="col d-flex align-items-center justify-content-center">
                            <img src="logo.png" width="30" height="30" alt="logo"/></div>
                        <div className="col d-flex align-items-center justify-content-end">
                            <a target="_blank" href="https://github.com/wing-kai/epub-manga-creator/blob/gh-pages/about.md">About</a>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <a target="_blank" href="https://wing-kai.github.io/epub-manga-creator/howto.html">How to</a>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <iframe
                                style={{border:"none"}}
                                src="https://ghbtns.com/github-btn.html?user=wing-kai&amp;repo=epub-manga-creator&amp;type=star&amp;count=true"
                                frameBorder="0"
                                scrolling="0"
                                width="80px"
                                height="20px"
                            />
                        </div>
                    </div>
                    <Modal name={this.state.showModal} State={State} Action={Action} handleHideModal={this.handleHideModal} />
                </div>
            </div>
        )
    }

    handleClickImportButton() {
        document.getElementById('input-upload').click();
    }

    handleShowModal(e) {
        const { modalName } = e.currentTarget.dataset;
        this.setState({
            showModal: modalName
        });
    }

    handleHideModal() {
        this.setState({
            showModal: ModalName.None
        });
    }
}

export default connect(
    ({ present, past, future }) => {
        return {
            State: {
                mangaInfo: present.mangaInfo,
                pageInfo: present.pageInfo,
                undoable: past.length > 0,
                redoable: future.length > 0
            }
        }
    },
    dispatch => ({
        Action: bindActionCreators({
            ...ActionCreators.pageInfo,
            ...ActionCreators.mangaInfo,
            ...ActionCreators.undo
        }, dispatch)
    })
)(Main);