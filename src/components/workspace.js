import React, { Component } from 'react'
import BlobStore from '../blob_store'
import { Button, Icon, Row } from './common'

const handleClickChangePangeIndex = Action => e => {
    const originIndex = Number(e.currentTarget.dataset.index);
    const newIndex = Number(prompt("New Index (number only) :"));
    
    if (!isNaN(newIndex) && newIndex > 0) {
        Action.changePageIndex(originIndex, newIndex - 1);
    }
}

const handleClickRemovePage = Action => e => {
    const index = Number(e.currentTarget.dataset.index);
    if (window.confirm('确定移除第 ' + (index + 1) + ' 页？')) {
        Action.removePage(index);
    }
}

const BlankCard = props => (
    <div style={{marginTop: 20}} className="card" />
);

const PageCard = props => {
    const { Action, index, float } = props;

    return (
        <div className="card" style={{marginTop: 20}}>
            <img
                className={"card-image align-self-" + (float === 'left' ? 'start' : 'end')}
                src={props.src}
                alt=""
                width="130"
                height="180"
            />
            <div className="card-img-overlay d-flex" style={{cursor: "default"}}>
                <small className="page-number card-text text-white rounded" style={{backgroundColor:"rgba(0, 0, 0, 0.7)", border: 'solid 1px #fff'}}>
                    &nbsp;{props.index + 1}&nbsp;
                </small>
                <p className="control card-text rounded" style={{backgroundColor:"rgba(0, 0, 0, 0.7)"}}>
                    &nbsp;&nbsp;
                    <a
                        href="javascript:;"
                        className="text-white"
                        onClick={e => Action.setCover(index)}
                    >
                        <Icon name="book" />
                    </a>
                    &nbsp;&nbsp;
                    <a
                        href="javascript:;"
                        className="text-white"
                        onClick={e => Action.cutPage(index)}
                    >
                        <Icon name="cut" />
                    </a>
                    &nbsp;&nbsp;
                    <a
                        href="javascript:;"
                        className="text-white"
                        data-index={index}
                        onClick={handleClickRemovePage(Action)}
                    >
                        <Icon name="times" />
                    </a>
                    &nbsp;&nbsp;
                    <a
                        href="javascript:;"
                        className="text-white"
                        data-index={index}
                        onClick={handleClickChangePangeIndex(Action)}
                    >
                        <span className="fa fa-reorder" />
                    </a>
                    &nbsp;&nbsp;
                </p>
            </div>
        </div>
    )
}

class WorkSpace extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        const { Action, State } = this.props;

        const { direction } = State.pageInfo;
        const insert  = direction === 'right' ? 'unshift' : 'push';

        let row       = [];
        let col       = [];
        let cardGroup = [];
        let maxIndex  = State.pageInfo.list.length - 1;

        State.pageInfo.list.map((fileIndex, i) => {

            if (i === 0)
                cardGroup[insert](<BlankCard key="blankCard-head" />);

            if (cardGroup.length === 2) {
                cardGroup = [];
                cardGroup[insert](
                    <PageCard
                        float={direction === 'left' ? 'right' : 'left'}
                        src={BlobStore.getObjectURL(fileIndex)} 
                        index={i} Action={Action} key={i}
                    />
                );
            } else {
                cardGroup[insert](
                    <PageCard
                        float={direction === 'left' ? 'left' : 'right'}
                        src={BlobStore.getObjectURL(fileIndex)} 
                        index={i} Action={Action} key={i}
                    />
                );
            }

            if (i === maxIndex && cardGroup.length === 1)
                cardGroup[insert](<BlankCard key="blankCard-tail" />);

            if (cardGroup.length == 2) {
                col[insert](
                    <div className="col" key={'cardgroup-' + i}>
                        <div className="card-group">
                            {cardGroup}
                        </div>
                    </div>
                );
            }

            if (i === maxIndex && col.length < 3) {
                let count = 3 - col.length;
                while(count-- > 0)
                    col[insert](<div className="col" key={'emptyCol-' + count} />);
            }

            if (col.length === 3) {
                row.push(<Row key={'Row-' + row.length}>{col}</Row>);
                col = [];
            }
        });

        return (
            <div className="card">
                <div className="card-block">
                    {row}
                </div>
            </div>
        );
    }
}

export default WorkSpace