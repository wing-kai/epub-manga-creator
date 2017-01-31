import React, { Component } from 'react'

const Button = props => {
    const { color, size, float } = props;

    const disabled = Boolean(props.disabled);
    const active   = Boolean(props.active);

    let className = "btn";
    let currentProps = {};

    className = className + (color ? " btn-" + color : "");
    className = className + (size ? " btn-" + size : "");
    className = className + (float ? " float-" + float : "");
    className = className + (active ? " active" : "");

    Object.keys(props).map(key => {
        if ((key !== "color") && (key !== "size") && (key !== "float") && (key !== "active") && (key !== "disabled")) {
            currentProps[key] = props[key];
        }
    });

    if (disabled === true) {
        currentProps.disabled = true;
    }

    return <button className={className} {...currentProps} />
}

const Icon = props => {
    const { fw, name } = props;
    let className = "fa fa-" + name;

    className = Boolean(fw) ? className + " fa-fw" : className + "";

    return <span className={className} />
}

const Row = props => (<div className="row" {...props} />)

export {
    Row,
    Button,
    Icon
}