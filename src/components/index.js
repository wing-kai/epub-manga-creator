import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import clone from 'clone'

import ActionCreators from '../actions'
import BlobStore from '../blob_store'

import { Button, Icon, Row } from './common'
import { ContentItem, EditContentPanel } from './contents'
import ControlBar from './control_bar'

class PageCard extends Component {
    constructor(props) {
        super(props);

        this.handleClickSetCover           = this.handleClickSetCover.bind(this);
        this.handleClickRemovePage         = this.handleClickRemovePage.bind(this);
        this.handleClickMoveToNextPage     = this.handleClickMoveToNextPage.bind(this);
        this.handleClickMoveToPreviousPage = this.handleClickMoveToPreviousPage.bind(this);
        this.handleClickChangePangeIndex   = this.handleClickChangePangeIndex.bind(this);
        this.handleClickCutPage            = this.handleClickCutPage.bind(this);
    }

    render() {
        const { props } = this;

        return (
            <div className="card" style={{marginTop: 20, background: "#f6f6f6"}}>
                <img src={props.src} style={{alignSelf: "center"}} className="card-img-top" height="210" width="140"/>
                <div className="card-block" style={{borderTop: "1px solid rgba(0,0,0,.125)", background: "#fff"}}>
                    <div className="btn-toolbar justify-content-between">
                        <div className="btn-group">
                            <Button color="secondary" size="sm" {...props.index === 0 ? {disabled: "true"} : {onClick: this.handleClickSetCover}}>
                                <Icon name="book" />
                            </Button>
                            <Button color="secondary" size="sm" onClick={this.handleClickCutPage}>
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

    handleClickCutPage() {
        const { Action, index } = this.props;
        Action.cutPage(index);
    }

    handleClickChangePangeIndex() {
        const { Action, index } = this.props;
        const newIndex = Number(prompt("New Index (number only) :"));
        
        if (!isNaN(newIndex) && newIndex > 0) {
            Action.changePageIndex(index, newIndex - 1);
        }
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
                                                <option value="少女" />
                                                <option value="青年" />
                                                <option value="同人誌" />
                                                <option value="漫画" />
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
                                                <option value="zh-Hans" />
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
        const title    = this.refs.g_title.value;
        const creator  = this.refs.g_creator.value;
        const subject  = this.refs.g_subject.value;
        const language = this.refs.g_language.value;

        this.props.handleSaveGlobalInfo({ title, creator, subject, language});
    }
}

class EditViewportPanel extends Component {
    constructor(props) {
        super(props);

        this.handleClickSaveButton = this.handleClickSaveButton.bind(this);
        this.handleSetPosition = this.handleSetPosition.bind(this);
        this.handleSetBackgroundColor = this.handleSetBackgroundColor.bind(this);

        this.state = {
            position: props.position,
            color: props.backgroundColor
        }
    }

    render() {
        const { position, color } = this.state;

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
                            <p></p>
                            <Row>
                                <div className="col-6">
                                    <div className="card-group">
                                        <div className="card ">
                                            <img src="images/exp4.png" height="100" style={{width:"100%"}} className="card-img-top viewport-img"/>
                                            <div className="card-footer text-center text-muted">
                                                <Button color={position === "stretch" ? "info" : "secondary"} onClick={this.handleSetPosition} size="sm" data-position="stretch">Stretch</Button>
                                            </div>
                                        </div>
                                        <div className="card">
                                            <img src="images/exp1.png" height="100" style={{width:"100%"}} className="card-img-top viewport-img"/>
                                            <div className="card-footer text-center text-muted">
                                                <Button color={position === "fill" ? "info" : "secondary"} onClick={this.handleSetPosition} size="sm" data-position="fill">Fill</Button>
                                            </div>
                                        </div>
                                        <div className="card">
                                            <img src="images/exp2.png" height="100" style={{width:"100%"}} className="card-img-top viewport-img"/>
                                            <div className="card-footer text-center text-muted">
                                                <Button color={position === "fit" ? "info" : "secondary"} onClick={this.handleSetPosition} size="sm" data-position="fit">Fit</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="card-group">
                                        <div className="card">
                                            <img src="images/exp5.png" height="100" style={{width:"100%"}} className="card-img-top viewport-img"/>
                                            <div className="card-footer text-center text-muted">
                                                <Button color={color === "black" ? "info" : "secondary"} onClick={this.handleSetBackgroundColor} size="sm" data-color="black">Black</Button>
                                            </div>
                                        </div>
                                        <div className="card">
                                            <img src="images/exp3.png" height="100" style={{width:"100%"}} className="card-img-top viewport-img"/>
                                            <div className="card-footer text-center text-muted">
                                                <Button color={color === "white" ? "info" : "secondary"} onClick={this.handleSetBackgroundColor} size="sm" data-color="white">White</Button>
                                            </div>
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

        this.props.handleSaveViewportInfo({
            height,
            width,
            position: this.state.position,
            backgroundColor: this.state.color
        });
    }

    handleSetPosition(e) {
        const position = e.currentTarget.dataset.position;
        this.setState({ position });
    }

    handleSetBackgroundColor(e) {
        const color = e.currentTarget.dataset.color;
        this.setState({ color });
    }
}

class Main extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showBookInfoPanel: false,
            showViewportPanel: false,
            showContentsPanel: false
        }

        this.handleToggleGlobalInfoPanel = this.handleToggleGlobalInfoPanel.bind(this);
        this.handleSaveGlobalInfo        = this.handleSaveGlobalInfo.bind(this);
        this.handleToggleViewportPanel   = this.handleToggleViewportPanel.bind(this);
        this.handleSaveViewportInfo      = this.handleSaveViewportInfo.bind(this);
        this.handleToggleContentsPanel   = this.handleToggleContentsPanel.bind(this);
        this.handleSaveContentsInfo      = this.handleSaveContentsInfo.bind(this);
        this.handleHideAllPanel          = this.handleHideAllPanel.bind(this);
    }

    render() {
        const { Action, State } = this.props;

        let rowNum     = Math.ceil(State.pageInfo.list.length / 5);
        let blankCard  = 5 - State.pageInfo.list.length % 5;
        let colCount   = 0;
        let rowContent = [];
        let colContent = [];
        let maxIndex   = State.pageInfo.list.length - 1;

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
                        &nbsp;
                        <iframe
                            style={{border:"none"}}
                            src="https://ghbtns.com/github-btn.html?user=wing-kai&amp;repo=epub-manga-creator&amp;type=star&amp;count=true"
                            frameBorder="0"
                            scrolling="0"
                            width="170px"
                            height="20px"
                        />
                    </h3>
                </nav>
                <p />
                <div className="container">
                    <ControlBar
                        Action={Action}
                        State={State}
                        handleToggleGlobalInfoPanel={this.handleToggleGlobalInfoPanel}
                        handleToggleViewportPanel={this.handleToggleViewportPanel}
                        handleToggleContentsPanel={this.handleToggleContentsPanel}
                        handleHideAllPanel={this.handleHideAllPanel}
                    />
                    <p />
                    {
                        this.state.showBookInfoPanel
                        ? [<EditBookInfoPanel key="EditBookInfoPanel" handleSaveGlobalInfo={this.handleSaveGlobalInfo} {...State.mangaInfo.global} />, <p key="p" />]
                        : undefined
                    }
                    {
                        this.state.showContentsPanel
                        ? [<EditContentPanel key="EditContentPanel" contents={State.mangaInfo.contents} handleClickSaveButton={this.handleSaveContentsInfo} />, <p key="p" />]
                        : undefined
                    }
                    {
                        this.state.showViewportPanel
                        ? [<EditViewportPanel key="EditViewportPanel" handleSaveViewportInfo={this.handleSaveViewportInfo} {...State.pageInfo.viewport} />, <p key="p" />]
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
                    <p>&nbsp;</p>
                </div>
            </div>
        )
    }

    handleToggleGlobalInfoPanel() {
        this.setState({
            showBookInfoPanel: !this.state.showBookInfoPanel,
            showViewportPanel: false,
            showContentsPanel: false
        });
    }

    handleToggleViewportPanel() {
        this.setState({
            showBookInfoPanel: false,
            showViewportPanel: !this.state.showViewportPanel,
            showContentsPanel: false
        });
    }

    handleToggleContentsPanel() {
        this.setState({
            showBookInfoPanel: false,
            showViewportPanel: false,
            showContentsPanel: !this.state.showContentsPanel
        });
    }

    handleSaveGlobalInfo({ title, creator, subject, language}) {
        this.setState({
            showBookInfoPanel: false
        });

        this.props.Action.saveGlobalSetting(title, creator, subject, language);
    }

    handleSaveViewportInfo(data) {
        this.setState({
            showViewportPanel: false
        });

        this.props.Action.saveViewportSetting(data);
    }

    handleSaveContentsInfo(data) {
        this.setState({
            showContentsPanel: false
        });

        this.props.Action.saveContentsSetting(data);
    }

    handleHideAllPanel() {
        this.setState({
            showBookInfoPanel: false,
            showViewportPanel: false,
            showContentsPanel: false
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