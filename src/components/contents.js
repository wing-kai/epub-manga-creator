import React, { Component } from 'react'
import clone from 'clone'

import { Button, Icon, Row } from './common'

const ContentItem = props => (
    <li className="list-group-item">
        <div className="row" style={{flexGrow: 1}}>
            <div className="col">
                <input
                    data-type="text"
                    data-index={props.index}
                    value={props.text} 
                    type="text" 
                    className="form-control input-sm"
                    placeholder="title"
                    onChange={props.handleBlurInput}
                />
            </div>
            <div className="col">
                <input
                    data-type="refindex"
                    data-index={props.index}
                    value={props.refindex}
                    type="number"
                    min="1"
                    className="form-control input-sm"
                    placeholder="page number"
                    onChange={props.handleBlurInput}
                />
            </div>
            <div className="col" style={{display: "flex", justifyContent: "flex-end"}}>
                <div className="btn-toolbar">
                    <div className="btn-group">
                        <Button
                            color="secondary"
                            data-index={props.index}
                            onClick={props.handleClickPlusButton}
                        >
                            <Icon name="plus" />
                        </Button>
                        <Button
                            color="secondary"
                            data-index={props.index}
                            onClick={props.handleClickMinusButton}
                        >
                            <Icon name="minus" />
                        </Button>
                        <Button
                            color="secondary"
                            data-index={props.index}
                            onClick={props.handleClickUpButton}
                        >
                            <Icon name="angle-up" />
                        </Button>
                        <Button
                            color="secondary"
                            data-index={props.index}
                            onClick={props.handleClickDownButton}
                        >
                            <Icon name="angle-down" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </li>
)

class EditContentPanel extends Component {
    constructor(props) {
        super(props);

        this.handleBlurInput        = this.handleBlurInput.bind(this);
        this.handleClickUpButton    = this.handleClickUpButton.bind(this);
        this.handleClickDownButton  = this.handleClickDownButton.bind(this);
        this.handleClickPlusButton  = this.handleClickPlusButton.bind(this);
        this.handleClickMinusButton = this.handleClickMinusButton.bind(this);
        this.handleClickSaveButton  = this.handleClickSaveButton.bind(this);

        this.state = {
            contents: clone(props.contents)
        }
    }

    render() {
        return (
            <Row>
                <div className="col-8">
                    <div className="card">
                        <div className="card-header">Content</div>
                        <ul className="list-group list-group-flush">
                            {
                                this.state.contents.map((contentItem, i) => (
                                    <ContentItem
                                        key={"ci" + i}
                                        index={i}
                                        handleBlurInput={this.handleBlurInput}
                                        handleClickUpButton={this.handleClickUpButton}
                                        handleClickDownButton={this.handleClickDownButton}
                                        handleClickPlusButton={this.handleClickPlusButton}
                                        handleClickMinusButton={this.handleClickMinusButton}
                                        {...contentItem}
                                    />
                                ))
                            }
                        </ul>
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

    handleBlurInput(e) {
        const key = e.currentTarget.dataset.type;
        const index = e.currentTarget.dataset.index;
        const contents = clone(this.state.contents);

        contents[index][key] = e.currentTarget.value;

        this.setState({ contents });
    }

    handleClickUpButton(e) {
        const index = Number(e.currentTarget.dataset.index);
        if (index === 0)
            return;

        let contents = clone(this.state.contents);
        let contentItem = {...contents[index]};
        let previousContentItem = {...contents[index - 1]}

        contents.splice(index - 1, 2, contentItem, previousContentItem);

        this.setState({ contents });
    }

    handleClickDownButton(e) {
        const index = Number(e.currentTarget.dataset.index);
        let contents = clone(this.state.contents);

        if (index + 1 === contents.length)
            return;

        let contentItem = {...contents[index]};
        let nextContentItem = {...contents[index + 1]};

        contents.splice(index, 2, nextContentItem, contentItem);

        this.setState({ contents });
    }

    handleClickPlusButton(e) {
        const index = Number(e.currentTarget.dataset.index);
        let contents = clone(this.state.contents);
        let contentItem = { ...contents[index] };

        contents.splice(index, 1, contentItem, { refindex: "", text: "" });

        this.setState({ contents });
    }

    handleClickMinusButton(e) {
        const index = Number(e.currentTarget.dataset.index);
        let contents = clone(this.state.contents);
        contents.splice(index, 1);
        this.setState({ contents });
    }

    handleClickSaveButton() {
        this.props.handleClickSaveButton(this.state.contents);
    }
}

export {
    ContentItem,
    EditContentPanel
}