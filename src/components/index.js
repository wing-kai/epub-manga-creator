import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ActionCreators from '../actions'
import BlobStore from '../blob_store'
import { Button, Icon, Row } from './common'
import GenerateEPUB from '../generate_epub'

class PageCard extends Component {
    constructor(props) {
        super(props);

        this.handleClickSetCover           = this.handleClickSetCover.bind(this);
        this.handleClickRemovePage         = this.handleClickRemovePage.bind(this);
        this.handleClickMoveToNextPage     = this.handleClickMoveToNextPage.bind(this);
        this.handleClickMoveToPreviousPage = this.handleClickMoveToPreviousPage.bind(this);
        this.handleClickChangePangeIndex   = this.handleClickChangePangeIndex.bind(this);
    }

    render() {
        const { props } = this;

        return (
            <div className="card" style={{marginTop: 20, background: "#f6f6f6"}}>
                <img src={props.src} style={{alignSelf: "center"}} className="card-img-top" height="210" width="140"/>
                <div className="card-block" style={{borderTop: "1px solid rgba(0,0,0,.125)", background: "#fff"}}>
                    <div className="btn-toolbar">
                        <div className="btn-group">
                            <Button color="secondary" size="sm" {...props.index === 0 ? {disabled: "true"} : {onClick: this.handleClickSetCover}}>
                                <Icon name="book" />
                            </Button>
                            <Button color="secondary" size="sm" disabled="true">
                                <Icon name="repeat" />
                            </Button>
                            <Button color="secondary" size="sm" disabled="true">
                                <Icon name="cut" />
                            </Button>
                            <Button color="secondary" size="sm" onClick={this.handleClickRemovePage}>
                                <Icon name="times" />
                            </Button>
                        </div>
                        &nbsp;
                        <div className="btn-group">
                            <Button color="secondary" size="sm" {...props.index === 0 ? {disabled: "true"} : {onClick: this.handleClickMoveToPreviousPage}}>
                                <Icon name="angle-left" />
                            </Button>
                            <Button color="secondary" size="sm" onClick={this.handleClickMoveToNextPage}>
                                <Icon name="angle-right" />
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="card-footer text-center" onClick={this.handleClickChangePangeIndex}>
                    <div className="card-text text-muted" style={{cursor: "default"}}>{props.index === 0 ? "Cover" : props.index + 1}</div>
                </div>
            </div>
        )
    }

    handleClickSetCover() {
        const { Action, index } = this.props;
        Action.setCover(index);
    }

    handleClickRemovePage() {
        const { Action, index } = this.props;
        Action.removePage(index);
    }

    handleClickMoveToNextPage() {
        const { Action, index } = this.props;
        Action.moveToNextPage(index);
    }

    handleClickMoveToPreviousPage() {
        const { Action, index } = this.props;
        Action.moveToPreviousPage(index);
    }

    handleClickChangePangeIndex() {
        const { Action, index } = this.props;
        const newIndex = Number(prompt("New Index (number only) :"));
        
        if (!isNaN(newIndex) && newIndex > 0) {
            Action.changePageIndex(index, newIndex - 1);
        }
    }
}

class ControlBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            firstUpload: true,
            generating: false
        }

        this.handleClickUploadButton = this.handleClickUploadButton.bind(this);
        this.handleClickGenerateButton = this.handleClickGenerateButton.bind(this);
    }

    render() {
        const { props, state } = this;

        return (
            <Row>
                <div className="col">
                    <div className="card card-default">
                        <div className="card-block">
                            <p className="card-text" style={{cursor:"default"}}>
                                <Button color="primary" onClick={this.handleClickUploadButton} title="update images">
                                    <Icon name="upload" fw="true" />
                                </Button>
                                &nbsp;
                                <Button color="secondary" {...state.firstUpload ? {disabled: "true"} : {}} onClick={props.handleToggleGlobalInfoPanel} title="edit book info">
                                    <Icon name="edit" fw="true" />
                                </Button>
                                &nbsp;
                                <Button color="secondary" disabled="true">
                                    <Icon name="square-o" fw="true" />
                                </Button>
                                &nbsp;
                                <Button color="secondary" disabled="true" title="edit contents">
                                    <Icon name="list-ul" fw="true" />
                                </Button>
                                &nbsp;
                                <Button color="secondary" disabled="true">
                                    <Icon name="cut" fw="true" disabled="true" />
                                </Button>
                                &nbsp;
                                <Button color="secondary" {...state.firstUpload ? {disabled: "true"} : {}} onClick={props.handleToggleViewportPanel} title="edit view setting">
                                    <Icon name="eye" fw="true" />
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
                            </p>
                        </div>
                    </div>
                </div>
            </Row>
        )
    }

    handleClickUploadButton() {
        const input = document.createElement('input');
        const acceptType = 'image/jpeg,image/png';
        const { Action } = this.props;
        const component = this;

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
            Action.updateUUID();
            component.setState({
                generating: false
            });
        });
    }
}

class EditNCXPanel extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Row>
                <div className="col-8">
                    <div className="card">
                        <div className="card-header">NCX</div>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item">
                                <div className="row" style={{flexGrow: 1}}>
                                    <div className="col">
                                        <input type="text" className="form-control input-sm" placeholder="title"/>
                                    </div>
                                    <div className="col">
                                        <input type="number" min="1" className="form-control input-sm" placeholder="page num"/>
                                    </div>
                                    <div className="col" style={{display: "flex", justifyContent: "flex-end"}}>
                                        <Button color="secondary">
                                            <Icon name="plus" />
                                        </Button>
                                        &nbsp;
                                        <Button color="secondary">
                                            <Icon name="minus" />
                                        </Button>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <div className="card-footer">
                            <Button color="primary">
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            </Row>
        )
    }
}

class EditBookInfoPanel extends Component {
    constructor(props) {
        super(props);

        this.handleClickSaveButton = this.handleClickSaveButton.bind(this);
    }

    render() {
        const { props } = this;

        return (
            <Row>
                <div className="col">
                    <div className="card">
                        <div className="card-header">Book Info</div>
                        <div className="card-block">
                            <Row>
                                <div className="col">
                                    <div className="form-group row">
                                        <label className="col-2 col-form-label">Title</label>
                                        <div className="col-10">
                                            <input defaultValue={props.title} ref="g_title" className="form-control" type="text"/>
                                        </div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="form-group row">
                                        <label className="col-2 col-form-label">Creator</label>
                                        <div className="col-10">
                                            <input defaultValue={props.creator} ref="g_creator" className="form-control" type="text"/>
                                        </div>
                                    </div>
                                </div>
                            </Row>
                            <p></p>
                            <Row>
                                <div className="col">
                                    <div className="form-group row">
                                        <label className="col-2 col-form-label">Subject</label>
                                        <div className="col-10">
                                            <input defaultValue={props.subject} ref="g_subject" list="datalist_subject" className="form-control" type="text"/>
                                            <datalist id='datalist_subject'>
                                                <option value="少年" />
                                                <option value="靑年" />
                                                <option value="成年コミック" />
                                            </datalist>
                                        </div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="form-group row">
                                        <label className="col-2 col-form-label">Language</label>
                                        <div className="col-10">
                                            <input defaultValue={props.language} ref="g_language" list="datalist_language" className="form-control" type="text"/>
                                            <datalist id='datalist_language'>
                                                <option value="ja" />
                                                <option value="zh-CN" />
                                                <option value="en-US" />
                                            </datalist>
                                        </div>
                                    </div>
                                </div>
                            </Row>
                        </div>
                        <div className="card-footer">
                            <Button color="primary" onClick={this.handleClickSaveButton}>Save</Button>
                        </div>
                    </div>
                </div>
            </Row>
        )
    }

    handleClickSaveButton() {
        const title = this.refs.g_title.value;
        const creator = this.refs.g_creator.value;
        const subject = this.refs.g_subject.value;
        const language = this.refs.g_language.value;

        this.props.handleSaveGlobalInfo({ title, creator, subject, language});
    }
}

class EditViewportPanel extends Component {
    constructor(props) {
        super(props);

        this.handleClickSaveButton = this.handleClickSaveButton.bind(this);
    }

    render() {
        return (
            <Row>
                <div className="col">
                    <div className="card">
                        <div className="card-header">viewport</div>
                        <div className="card-block">
                            <Row>
                                <div className="col">
                                    <div className="form-group row">
                                        <label className="col-2 col-form-label">Width&nbsp;(px)</label>
                                        <div className="col-10">
                                            <input ref="g_width" defaultValue={this.props.width} className="form-control" type="number"/>
                                        </div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="form-group row">
                                        <label className="col-2 col-form-label">Height&nbsp;(px)</label>
                                        <div className="col-10">
                                            <input ref="g_height" defaultValue={this.props.height} className="form-control" type="number"/>
                                        </div>
                                    </div>
                                </div>
                            </Row>
                        </div>
                        <div className="card-footer">
                            <Button color="primary" onClick={this.handleClickSaveButton}>
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            </Row>
        )
    }

    handleClickSaveButton() {
        const height = Number(this.refs.g_height.value);
        const width = Number(this.refs.g_width.value);

        this.props.handleSaveViewportInfo({ height, width });
    }
}

class Main extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showBookInfoPanel: false,
            showViewportPanel: false,
            showNCXPanel: false
        }

        this.handleToggleGlobalInfoPanel = this.handleToggleGlobalInfoPanel.bind(this);
        this.handleSaveGlobalInfo = this.handleSaveGlobalInfo.bind(this);
        this.handleToggleViewportPanel = this.handleToggleViewportPanel.bind(this);
        this.handleSaveViewportInfo = this.handleSaveViewportInfo.bind(this);
    }

    render() {
        const { Action, State } = this.props;

        let rowNum = Math.ceil(State.pageInfo.list.length / 5);
        let blankCard = 5 - State.pageInfo.list.length % 5;
        let colCount = 0;
        let rowContent = [];
        let colContent = [];
        let maxIndex = State.pageInfo.list.length - 1;

        blankCard = blankCard === 5 ? 0 : blankCard;

        State.pageInfo.list.map((fileIndex, i) => {
            colContent.push(
                <PageCard
                    key={rowNum + "-" + colCount}
                    src={BlobStore.getObjectURL(fileIndex)} 
                    index={i}
                    Action={Action}
                />
            );

            if (i === maxIndex) {
                colCount = 4;
                while (blankCard-- > 0) {
                    colContent.push(<div style={{marginTop: 20}} className="card" key={"blank-" + blankCard} />);
                }
            }

            if (colCount < 4) {
                colCount++
            } else {
                rowContent.push(
                    <Row key={"row-" + rowNum}>
                        <div className="col">
                            <div className="card-group">
                                {colContent}
                            </div>
                        </div>
                    </Row>
                );
                colContent = [];
                rowNum--;
                colCount = 0;
            }
        });

        return (
            <div>
                <nav className="navbar navbar-light bg-faded">
                    <h3 className="navbar-brand" href="">
                        Epub Manga Creator
                    </h3>
                </nav>
                <p />
                <div className="container">
                    <ControlBar
                        Action={Action}
                        State={State}
                        handleToggleGlobalInfoPanel={this.handleToggleGlobalInfoPanel}
                        handleToggleViewportPanel={this.handleToggleViewportPanel}
                    />
                    <p />
                    {
                        this.state.showViewportPanel
                        ? [<EditViewportPanel key="EditViewportPanel" handleSaveViewportInfo={this.handleSaveViewportInfo} {...State.pageInfo.viewport} />, <p key="p" />]
                        : undefined
                    }
                    {
                        this.state.showBookInfoPanel
                        ? [<EditBookInfoPanel key="EditBookInfoPanel" handleSaveGlobalInfo={this.handleSaveGlobalInfo} {...State.mangaInfo.global} />, <p key="p" />]
                        : undefined
                    }
                    <Row>
                        <div className="col">
                            <div className="card card-default">
                                <div className="card-header">
                                    Pages
                                </div>
                                <div className="card-block" style={{paddingTop: 0}}>
                                    {rowContent}
                                </div>
                            </div>
                        </div>
                    </Row>
                    <p></p>
                    <p className="text-muted">
                        <span className="float-right">wing-kai's work</span>
                    </p>
                    <p>&nbsp;</p>
                </div>
            </div>
        )
    }

    handleToggleGlobalInfoPanel() {
        this.setState({
            showBookInfoPanel: !this.state.showBookInfoPanel,
            showViewportPanel: false
        });
    }

    handleToggleViewportPanel() {
        this.setState({
            showBookInfoPanel: false,
            showViewportPanel: !this.state.showViewportPanel
        });
    }

    handleSaveGlobalInfo(data) {
        this.setState({
            showBookInfoPanel: false
        });

        this.props.Action.saveGlobalSetting(data);
    }

    handleSaveViewportInfo(data) {
        this.setState({
            showViewportPanel: false
        });

        this.props.Action.saveViewportSetting(data);
    }
}

export default connect(
  ({ mangaInfo, pageInfo }) => ({ State: { mangaInfo, pageInfo } }),
  dispatch => ({ Action: bindActionCreators({...ActionCreators.pageInfo, ...ActionCreators.mangaInfo} ,dispatch) })
)(Main);