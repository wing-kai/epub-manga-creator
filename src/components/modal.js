import React, { Component } from 'react'
import { Button, Icon, Row } from './common'
import clone from 'clone'

const ModalName = {
    None: 'None',
    BookInfo: 'BookInfo',
    ContentTable: 'ContentTable',
    Viewport: 'Viewport'
}

const modalShow = {display: 'block', background: 'rgba(0, 0, 0, 0.5)'};

const stopPropagation = e => e.stopPropagation();

const ModalBody = props => (
    <div className="modal" style={modalShow} onClick={props.handleHideModal}>
        <div className="modal-dialog" onClick={stopPropagation}>
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">{props.title}</h5>
                    <button type="button" className="close" onClick={props.handleHideModal}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">{props.children}</div>
            </div>
        </div>
    </div>
);

const FormGroupRow = props => (
    <div className="form-group row">
        <small className="col-2">{props.label}</small>
        <div className="col-7">{props.children}</div>
    </div>
);

class BookInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            creator: [...props.State.mangaInfo.bookInfo.creator]
        }

        this.handleChangeCreatorName = this.handleChangeCreatorName.bind(this);
        this.handleBlurInput = this.handleBlurInput.bind(this);
    }

    render() {

        const { State: { mangaInfo: { bookInfo } }, Action } = this.props;

        return (
            <ModalBody title="漫画信息" handleHideModal={this.props.handleHideModal}>
                <FormGroupRow label="ID">
                    <input
                        defaultValue={bookInfo.id}
                        className="form-control-sm form-control"
                        type="text"
                        ref="id"
                        onBlur={this.handleBlurInput}
                    />
                </FormGroupRow>
                <FormGroupRow label="书名">
                    <input
                        defaultValue={bookInfo.title}
                        className="form-control-sm form-control"
                        type="text"
                        ref="title"
                        onBlur={this.handleBlurInput}
                    />
                </FormGroupRow>
                {
                    this.state.creator.map((name, i) => (
                        <div className="form-group row" key={i}>
                            <small className="col-2">{'作者 ' + (i + 1)}</small>
                            <div className="col-7">
                                <input
                                    data-index={i}
                                    value={this.state.creator[i]}
                                    className="form-control-sm form-control"
                                    type="text"
                                    onChange={this.handleChangeCreatorName}
                                    onBlur={this.handleBlurInput}
                                />
                            </div>
                            <div className="col-3">
                                <div className="btn-toolbar">
                                    <div className="btn-group">
                                        <button className="btn btn-sm btn-secondary" onClick={e => Action.addCreator(i)}>
                                            <Icon name="plus" />
                                        </button>
                                        {
                                            this.state.creator.length < 2 ? (
                                                <button className="btn btn-sm btn-secondary" disabled={true}>
                                                    <Icon name="minus" />
                                                </button>
                                            ) : (
                                                <button className="btn btn-sm btn-secondary" onClick={e => Action.removeCreator(i)}>
                                                    <Icon name="minus" />
                                                </button>
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                }
                <FormGroupRow label="类别">
                    <input
                        defaultValue={bookInfo.subject}
                        className="form-control-sm form-control"
                        type="text"
                        list="datalist_subject"
                        ref="subject"
                        onBlur={this.handleBlurInput}
                    />
                    <datalist id="datalist_subject">
                        <option value="少年" />
                        <option value="少女" />
                        <option value="青年" />
                        <option value="同人誌" />
                        <option value="漫画" />
                        <option value="成年コミック" />
                    </datalist>
                </FormGroupRow>
                <FormGroupRow label="出版社">
                    <input
                        defaultValue={bookInfo.publisher}
                        className="form-control-sm form-control"
                        type="text"
                        list="datalist_publisher"
                        ref="publisher"
                        onBlur={this.handleBlurInput}
                    />
                    <datalist id="datalist_publisher">
                        <option value="KADOKAWA" />
                        <option value="講談社" />
                        <option value="集英社" />
                        <option value="小学館" />
                        <option value="小学館集英社プロダクション" />
                        <option value="少年画報社" />
                        <option value="松文館" />
                        <option value="日本文芸社" />
                        <option value="白泉社" />
                        <option value="芳文社" />
                        <option value="ワニマガジン社" />
                    </datalist>
                </FormGroupRow>
            </ModalBody>
        );
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            creator: [...nextProps.State.mangaInfo.bookInfo.creator]
        });
    }

    handleChangeCreatorName(e) {
        const input    = e.currentTarget;
        const creators = [...this.state.creator];

        creators[Number(input.dataset.index)] = input.value;

        this.setState({ creator: creators });
    }

    handleBlurInput(e) {
        const { refs } = this;
        this.props.Action.saveBookInfo(
            refs.id.value,
            refs.title.value,
            this.state.creator,
            refs.subject.value,
            refs.publisher.value
        );
    }
}

const ContentItem = props => (
    <div className="row" style={{marginTop: 10}}>
        <div className="col">
            <input
                data-index={props.index}
                type="number"
                min="1"
                value={props.refindex}
                className="form-control form-control-sm"
                onChange={props.handleChangeContentRefIndex}
            />
        </div>
        <div className="col-6">
            <input
                data-index={props.index}
                type="text"
                value={props.text}
                className="form-control form-control-sm"
                onChange={props.handleChangeContentText}
            />
        </div>
        <div className="col">
            <div className="btn-toolbar">
                <div className="btn-group">
                    <Button
                        size="sm"
                        color="secondary"
                        data-index={props.index}
                        onClick={props.handleClickPlusButton}
                    >
                        <Icon name="plus" />
                    </Button>
                    {
                        props.addOnly ? ([
                            <Button key="b1" size="sm" color="secondary" disabled={true}>
                                <Icon name="minus" />
                            </Button>,
                            <Button key="b2" size="sm" color="secondary" disabled={true}>
                                <Icon name="angle-up" />
                            </Button>,
                            <Button key="b3" size="sm" color="secondary" disabled={true}>
                                <Icon name="angle-down" />
                            </Button>
                        ]) : ([
                            <Button
                                key="b1"
                                size="sm"
                                color="secondary"
                                data-index={props.index}
                                onClick={props.handleClickMinusButton}
                            >
                                <Icon name="minus" />
                            </Button>,
                            <Button
                                key="b2"
                                size="sm"
                                color="secondary"
                                data-index={props.index}
                                onClick={props.handleClickUpButton}
                            >
                                <Icon name="angle-up" />
                            </Button>,
                            <Button
                                key="b3"
                                size="sm"
                                color="secondary"
                                data-index={props.index}
                                onClick={props.handleClickDownButton}
                            >
                                <Icon name="angle-down" />
                            </Button>
                        ])
                    }
                </div>
            </div>
        </div>
    </div>
)

class ContentTable extends Component {
    constructor(props) {
        super(props);

        this.handleChangeContentRefIndex = this.handleChangeContentRefIndex.bind(this);
        this.handleChangeContentText     = this.handleChangeContentText.bind(this);
        this.handleClickUpButton         = this.handleClickUpButton.bind(this);
        this.handleClickDownButton       = this.handleClickDownButton.bind(this);
        this.handleClickPlusButton       = this.handleClickPlusButton.bind(this);
        this.handleClickMinusButton      = this.handleClickMinusButton.bind(this);

        this.state = {
            contents: clone(props.State.mangaInfo.contents)
        }
    }

    render() {
        return (
            <ModalBody title="目录" handleHideModal={this.props.handleHideModal}>
                <div className="row">
                    <div className="col">页码</div>
                    <div className="col-6">标题</div>
                    <div className="col">调整</div>
                </div>
                {
                    this.state.contents.map((contentItem, i) => {
                        return (
                            <ContentItem
                                key={i}
                                index={i}
                                addOnly={this.state.contents.length === 1}
                                handleChangeContentRefIndex={this.handleChangeContentRefIndex}
                                handleChangeContentText={this.handleChangeContentText}
                                handleClickUpButton={this.handleClickUpButton}
                                handleClickDownButton={this.handleClickDownButton}
                                handleClickPlusButton={this.handleClickPlusButton}
                                handleClickMinusButton={this.handleClickMinusButton}
                                {...contentItem}
                            />
                        );
                    })
                }
            </ModalBody>
        );
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            contents: clone(nextProps.State.mangaInfo.contents)
        });
    }

    handleChangeContentRefIndex(e) {
        const input = e.currentTarget;
        const contents = clone(this.state.contents);

        contents[Number(input.dataset.index)].refindex = Number(input.value);

        this.props.Action.saveContentsSetting(contents);
    }

    handleChangeContentText(e) {
        const input = e.currentTarget;
        const contents = clone(this.state.contents);

        contents[Number(input.dataset.index)].text = input.value;

        this.props.Action.saveContentsSetting(contents);
    }

    handleClickUpButton(e) {
        const index = Number(e.currentTarget.dataset.index);
        if (index === 0)
            return;

        let contents = clone(this.state.contents);
        let contentItem = {...contents[index]};
        let previousContentItem = {...contents[index - 1]}

        contents.splice(index - 1, 2, contentItem, previousContentItem);

        this.props.Action.saveContentsSetting(contents);
    }

    handleClickDownButton(e) {
        const index = Number(e.currentTarget.dataset.index);
        let contents = clone(this.state.contents);

        if (index + 1 === contents.length)
            return;

        let contentItem = {...contents[index]};
        let nextContentItem = {...contents[index + 1]};

        contents.splice(index, 2, nextContentItem, contentItem);

        this.props.Action.saveContentsSetting(contents);
    }

    handleClickPlusButton(e) {
        const index = Number(e.currentTarget.dataset.index);
        let contents = clone(this.state.contents);
        let contentItem = { ...contents[index] };

        contents.splice(index, 1, contentItem, { refindex: "", text: "" });

        this.props.Action.saveContentsSetting(contents);
    }

    handleClickMinusButton(e) {
        const index = Number(e.currentTarget.dataset.index);
        let contents = clone(this.state.contents);

        contents.splice(index, 1);

        this.props.Action.saveContentsSetting(contents);
    }
}

const handleChangeViewportSetting = (refs, Action) => e => {
    Action.saveViewportSetting(
        refs.width.value,
        refs.height.value,
        refs.position.value,
        refs.backgroundColor.value,
        refs.direction.value
    );
}

const ViewportRowItem = props => (
    <div className="row">
        <div className="col-3 d-flex align-items-center justify-content-end">{props.label}</div>
        <div className="col">{props.children}</div>
    </div>
);

const Viewport = props => {
    const { Action, State: { pageInfo: { viewport } } } = props;
    const { direction } = props.State.pageInfo;
    const refs = {
        width:           undefined,
        height:          undefined,
        position:        undefined,
        backgroundColor: undefined,
        direction:       undefined
    }

    return (
        <ModalBody title="页面显示" handleHideModal={props.handleHideModal}>
            <ViewportRowItem label="宽度 (px)">
                <input
                    defaultValue={viewport.width}
                    type="number"
                    className="form-control"
                    ref={dom => refs.width = dom}
                    onChange={handleChangeViewportSetting(refs, Action)}
                />
            </ViewportRowItem>
            <p />
            <ViewportRowItem label="高度 (px)">
                <input
                    defaultValue={viewport.height}
                    type="number"
                    className="form-control"
                    ref={dom => refs.height = dom}
                    onChange={handleChangeViewportSetting(refs, Action)}
                />
            </ViewportRowItem>
            <p />
            <ViewportRowItem label="页面显示">
                <select
                    className="form-control custom-select"
                    defaultValue={viewport.position}
                    ref={dom => refs.position = dom}
                    onChange={handleChangeViewportSetting(refs, Action)}
                >
                    <option value="stretch">拉伸</option>
                    <option value="fill">填充</option>
                    <option value="fit">适应</option>
                </select>
            </ViewportRowItem>
            <p />
            <ViewportRowItem label="">
                {
                    viewport.position === 'stretch' ? (
                        <img src="images/exp4.png" width="200" height="100" />
                    ) : viewport.position === 'fill' ? (
                        <img src="images/exp1.png" width="200" height="100" />
                    ) : (
                        <img src="images/exp2.png" width="200" height="100" />
                    )
                }
            </ViewportRowItem>
            <p />
            <ViewportRowItem label="背景颜色">
                <select
                    className="form-control custom-select"
                    defaultValue={viewport.backgroundColor}
                    ref={dom => refs.backgroundColor = dom}
                    onChange={handleChangeViewportSetting(refs, Action)}
                >
                    <option value="white">白色</option>
                    <option value="black">黑色</option>
                </select>
            </ViewportRowItem>
            <p />
            <ViewportRowItem label="">
                <img src={viewport.backgroundColor === 'white' ? "images/exp3.png" : "images/exp5.png"} width="200" height="100" />
            </ViewportRowItem>
            <p />
            <ViewportRowItem label="翻页方向">
                <select
                    className="form-control custom-select"
                    defaultValue={direction}
                    ref={dom => refs.direction = dom}
                    onChange={handleChangeViewportSetting(refs, Action)}
                >
                    <option value="right">右（日式）</option>
                    <option value="left">左</option>
                </select>
            </ViewportRowItem>
        </ModalBody>
    )
};

const Modal = props => {
    switch (props.name) {
        case ModalName.BookInfo:
            return <BookInfo {...props} />

        case ModalName.ContentTable:
            return <ContentTable {...props} />

        case ModalName.Viewport:
            return <Viewport {...props} />

        default:
            return null;
    }
}

export { ModalName }

export default Modal