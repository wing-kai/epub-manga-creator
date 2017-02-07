import React, { Component } from 'react'
import { Button, Icon, Row } from './common'
import GenerateEPUB from '../generate_epub'

class ControlBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            firstUpload: true,
            generating: false
        }

        this.handleClickUploadButton   = this.handleClickUploadButton.bind(this);
        this.handleClickGenerateButton = this.handleClickGenerateButton.bind(this);
        this.handleClickAddBlankPage   = this.handleClickAddBlankPage.bind(this);
        this.handleClickUndoButton     = this.handleClickUndoButton.bind(this);
        this.handleClickRedoButton     = this.handleClickRedoButton.bind(this);
    }

    render() {
        const { props, state } = this;
        const { redoable, undoable } = props.State;

        return (
            <Row>
                <div className="col">
                    <div className="card card-default">
                        <div className="card-block">
                            <div className="card-text" style={{cursor:"default"}}>
                                <Button color="primary" onClick={this.handleClickUploadButton} title="update images">
                                    <Icon name="upload" fw="true" />
                                </Button>
                                &nbsp;
                                <div className="btn-toolbar" style={{display: "inline-block"}}>
                                    <div className="btn-group">
                                        <Button
                                            color="secondary"
                                            title="edit book info"
                                            {...state.firstUpload ? {disabled: "true"} : {onClick: props.handleToggleGlobalInfoPanel}}
                                        >
                                            <Icon name="edit" fw="true" />
                                        </Button>
                                        <Button
                                            color="secondary"
                                            title="add blank page"
                                            {...state.firstUpload ? {disabled: "true"} : {onClick: this.handleClickAddBlankPage}}
                                        >
                                            <Icon name="square-o" fw="true" />
                                        </Button>
                                        <Button
                                            color="secondary"
                                            title="edit contents"
                                            {...state.firstUpload ? {disabled: "true"} : {onClick: props.handleToggleContentsPanel}}
                                        >
                                            <Icon name="list-ul" fw="true" />
                                        </Button>
                                        <Button
                                            color="secondary"
                                            title="edit view setting"
                                            {...state.firstUpload ? {disabled: "true"} : {onClick: props.handleToggleViewportPanel}}
                                        >
                                            <Icon name="eye" fw="true" />
                                        </Button>
                                    </div>
                                </div>
                                &nbsp;
                                <div className="btn-toolbar" style={{display: "inline-block"}}>
                                    <div className="btn-group">
                                        <Button
                                            color="secondary"
                                            title="undo"
                                            {...state.firstUpload || !undoable ? {disabled: "true"} : {onClick: this.handleClickUndoButton}}
                                        >
                                            <Icon fw="true" name="undo" />
                                        </Button>
                                        <Button
                                            color="secondary"
                                            title="redo"
                                            {...state.firstUpload || !redoable ? {disabled: "true"} : {onClick: this.handleClickRedoButton}}
                                        >
                                            <Icon fw="true" name="rotate-right" />
                                        </Button>
                                    </div>
                                </div>
                                &nbsp;
                                <Button
                                    color="secondary"
                                    title="reset"
                                    {...state.firstUpload ? {disabled: "true"} : {onClick: props.Action.reset}}
                                >
                                    <Icon name="circle" />
                                </Button>
                                {
                                    state.generating ? (
                                        <Button color="secondary" float="right" disabled="true">
                                            <span className="fa fa-spinner fa-pulse"></span>
                                        </Button>
                                    ) : (
                                        <Button color="success" float="right" onClick={this.handleClickGenerateButton}>
                                            <Icon name="download" fw="true" />
                                        </Button>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </Row>
        )
    }

    handleClickUploadButton() {
        const input      = document.createElement('input');
        const acceptType = 'image/jpeg,image/png';
        const { Action } = this.props;
        const component  = this;

        input.type = "file";
        input.multiple = "multiple";
        input.accept = acceptType;

        input.onchange = function(e) {
            const filesList = [...this.files].filter(fileObj => acceptType.indexOf(fileObj.type) > -1);

            if (filesList.length) {
                Action.importPages(filesList);

                if (component.state.firstUpload) {
                    component.setState({
                        firstUpload: false
                    });
                }
            }
        }

        input.click();
    }

    handleClickGenerateButton() {
        const component = this;
        const { Action } = this.props;

        new Promise(resolve => component.setState({
            generating: true
        }, resolve)).then(() => {
            return GenerateEPUB(component.props.State)
        }).then(() => {
            component.setState({
                generating: false
            });
        });
    }

    handleClickAddBlankPage() {
        const targetIndex = Number(prompt("index: (number only)"));

        if (!isNaN(targetIndex) && targetIndex > 0) {
            this.props.Action.addBlankPage(targetIndex - 1);
        }
    }

    handleClickUndoButton() {
        const { props } = this;
        props.handleHideAllPanel();
        props.Action.undo();
    }

    handleClickRedoButton() {
        const { props } = this;
        props.handleHideAllPanel();
        props.Action.redo();
    }
}

export default ControlBar