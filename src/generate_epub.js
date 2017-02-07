import JSZip from 'jszip'
import BlobStore from './blob_store'
import Template from './template'

const htmlToEscape = string => {
    const reg = /"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g;

    return string.replace(reg, ($0) => {
        let c = $0.charCodeAt(0);
        let r = ["&#"];

        c = (c == 0x20) ? 0xA0 : c;
        r.push(c);
        r.push(";");
        return r.join("");
    });
}

const counter = (num, zeroCount) => {
    let str = String(num);
    let i = zeroCount - str.length;
    while (i-- > 0) {
        str = "0" + str;
    }
    return str;
}

const generateRandomUUID = () => {
    const char = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    let uuid = "";
    let i = 36;

    while (i-- > 0) {
        if (i === 27 || i === 22 || i === 17 || i === 12) {
            uuid = uuid + "-";
        } else {
            uuid = uuid + String(char[Math.ceil(Math.random() * 35)])
        }
    }

    return uuid;
}

const generateEPUB = function(State) {
    const Zip = new JSZip();
    const UUID = generateRandomUUID();

    Zip.folder("META-INF");
    Zip.folder("OEBPS/image");
    Zip.folder("OEBPS/text");
    Zip.folder("OEBPS/style");

    // render toc.xhtml file

    let file_navigation_documents_xhtml = Template["navigation-documents.xhtml"];

    const navigationList = State.mangaInfo.contents.map(navPointInfo => {
        if (navPointInfo.refindex === 1)
            return '<li><a href="text/p_cover.xhtml">' + navPointInfo.text + '</a></li>';

        return '<li><a href="text/p_' + counter(navPointInfo.refindex - 2, 4) + '.xhtml">' + navPointInfo.text + '</a></li>';
    }).join('\n');

    file_navigation_documents_xhtml = file_navigation_documents_xhtml
        .replace("{{language}}", State.mangaInfo.global.language)
        .replace('<!-- navigation-list -->', navigationList)

    // render standard.opf file

    let file_opf = Template["standard.opf"];

    const imageItemStr = State.pageInfo.list.map((blobIndex, index) => {
        const blob = BlobStore.getBlobObject(blobIndex);
        const mimetype = String(blob.type);

        if (index === 0)
            return '<item id="cover" href="image/cover.' + mimetype.slice(6) + '" media-type="' + mimetype + '" properties="cover-image"></item>'

        const num = counter(index - 1, 4);
        return '<item id="i_' + num + '" href="image/i_' + num + '.' + mimetype.slice(6) + '" media-type="' + mimetype + '"></item>';
    }).join('\n');

    const pageItemStr = State.pageInfo.list.map((b, index) => {
        if (index === 0)
            return '';

        const num = counter(index - 1, 4);
        return '<item id="p_' + num + '" href="text/p_' + num + '.xhtml" media-type="application/xhtml+xml" properties="svg" fallback="i_' + num + '"></item>';
    }).join('\n');

    let spread = "right";
    const itemrefStr = State.pageInfo.list.map((b, index) => {
        spread = spread === "left" ? "right" : "left";

        if (index === 0)
            return '';

        return '<itemref linear="yes" idref="p_' + counter(index - 1, 4) + '" properties="page-spread-' + spread + '"></itemref>';
    }).join('\n');

    file_opf = file_opf
        .replace("{{uuid}}", UUID)
        .replace("{{title}}", htmlToEscape(State.mangaInfo.global.title))
        .replace(new RegExp("{{language}}", "gm"), htmlToEscape(State.mangaInfo.global.language))
        .replace("{{creator}}", htmlToEscape(State.mangaInfo.global.creator))
        .replace("{{subject}}", htmlToEscape(State.mangaInfo.global.subject))
        .replace("{{createTime}}", new Date().toISOString())
        .replace("<!-- item-image -->", imageItemStr)
        .replace("<!-- item-xhtml -->", pageItemStr)
        .replace("<!-- itemref-xhtml -->", itemrefStr)

    // render page.xhtml file

    const files_page = {};
    State.pageInfo.list.map((blobIndex, index) => {
        const { position, width, height } = State.pageInfo.viewport;
        const num = index > 0 ? counter(index - 1, 4) : "cover";
        let positionStr = "none";

        if (position === "fit")  positionStr = "xMidYMid meet";
        if (position === "fill") positionStr = "xMidYMid slice";

        files_page["p_" + num + ".xhtml"] = Template['page.xhtml']
            .replace("{{language}}", htmlToEscape(State.mangaInfo.global.language))
            .replace("{{title}}", htmlToEscape(State.mangaInfo.global.title))
            .replace(new RegExp("{{width}}", "gm"), width)
            .replace(new RegExp("{{height}}", "gm"), height)
            .replace("{{image file src}}", "../image/" + (index > 0 ? 'i_' : '') + num + '.' + String(BlobStore.getBlobObject(blobIndex).type).slice(6))
            .replace("{{position}}", positionStr)
    });

    // Add file to zip object

    Zip.file("mimetype", Template.mimetype);
    Zip.file("META-INF/container.xml", Template["container.xml"]);
    Zip.file("OEBPS/style/fixed-layout-jp.css", Template["fixed-layout-jp.css"]);

    Zip.file("OEBPS/navigation-documents.xhtml", file_navigation_documents_xhtml);
    Zip.file("OEBPS/standard.opf", file_opf);

    State.pageInfo.list.map((blobIndex, i) => {
        const blob = BlobStore.getBlobObject(blobIndex);
        const numStr = i > 0 ? 'i_' + counter(i - 1, 4) : 'cover';
        Zip.file("OEBPS/image/" + numStr + "." + String(blob.type).slice(6), blob);
    });

    Object.keys(files_page).map(fileName => {
        Zip.file("OEBPS/text/" + fileName, files_page[fileName]);
    });

    return new Promise(resolve => {
        Zip.generateAsync({
            type: "blob",
            mimeType: "application/epub+zip"
        }).then(blob => {
            const anchor = document.createElement("a");
            const objectURL = window.URL.createObjectURL(blob);

            anchor.download = State.mangaInfo.global.title.trim() + ".epub";
            // anchor.download = State.mangaInfo.global.title.trim() + ".zip";
            anchor.href = objectURL;
            anchor.click();

            window.URL.revokeObjectURL(objectURL);
            resolve();
        });
    });
}

export default generateEPUB