let _fileList = {}; // { blob, objectURL }
let indexCount = 0;

const getLength = () => Object.keys(_fileList).length;

const importFiles = filesList => {
    let keyList = [];

    [...filesList].map(fileObj => {
        const blob = new Blob([fileObj], { type: String(fileObj.type) });
        const objectURL = window.URL.createObjectURL(blob);

        _fileList[String(indexCount)] = { blob, objectURL };
        keyList.push(indexCount);

        indexCount = indexCount + 1;
    });

    return keyList;
}

const updateFile = (index, blob) => {
    const i = String(index);

    window.URL.revokeObjectURL(_fileList[i].objectURL);

    _fileList[i] = {
        blob,
        objectURL: window.URL.createObjectURL(blob)
    }

    return i;
}

const removeAllBlob = () => {
    Object.keys(_fileList).map(key => {
        window.URL.revokeObjectURL(_fileList[key].objectURL);
    });

    _fileList = {};
}

const getObjectURL = index => _fileList[String(index)].objectURL;

const getBlobObject = index => _fileList[String(index)].blob;

const removeBlob = index => {
    const i = String(index);

    window.URL.revokeObjectURL(_fileList[i].objectURL);
    delete _fileList[i];

    return i;
}

export default {
    removeAllBlob,
    getLength,
    updateFile,
    importFiles,
    getObjectURL,
    getBlobObject,
    removeBlob
}