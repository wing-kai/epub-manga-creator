import JSZip from 'jszip'
import BlobStore from './blob_store'
import Template from './template'

const generateEPUB = function(State) {
    const Zip = new JSZip();

    Zip.folder("META-INF");
    Zip.folder("OPS/css");
    Zip.folder("OPS/images");
    Zip.folder("OPS/xhtml");

    // render toc.ncx file

    let file_ncx = Template["toc.ncx"];
    const navMapStr = State.mangaInfo.contents.map((navPointInfo, index) => (
        '<ncx:navPoint id="p' + navPointInfo.refindex + '" playOrder="' + (index + 1) + '"><ncx:navLabel><ncx:text>' + navPointInfo.text + '</ncx:text></ncx:navLabel><ncx:content src="p' + navPointInfo.refindex + '.xhtml"/></ncx:navPoint>'
    )).join('');

    file_ncx = file_ncx
        .replace(new RegExp("{{uuid}}", "gm"), State.mangaInfo.global.uuid)
        .replace(new RegExp("{{title}}", "gm"), State.mangaInfo.global.title)
        .replace(new RegExp("{{creator}}", "gm"), State.mangaInfo.global.creator)
        .replace(new RegExp("<!-- nav map -->", "gm"), navMapStr)

    // render toc.xhtml file

    let file_toc_xhtml = Template["toc.xhtml"];

    const tocListStr = State.mangaInfo.contents.map((navPointInfo, index) => (
        '<li epub:type="chapter" id="toc-' + (index + 1) + '"><a href="p' + navPointInfo.refindex + '.xhtml">' + navPointInfo.text + '</a></li>'
    )).join('');

    // cover & list string
    const pageListStr = '<li><a href="p1.xhtml">1</a></li>' + State.pageInfo.list.map((p, index) => (
        '<li><a href="p' + (index + 1) + '.xhtml">' + (index + 2) + '</a></li>'
    )).join('');

    file_toc_xhtml = file_toc_xhtml
        .replace(new RegExp("{{title}}", "gm"), State.mangaInfo.global.title)
        .replace(new RegExp("{{ncxTitle}}", "gm"), State.mangaInfo.ncxTitle)
        .replace(new RegExp("<!-- toc -->", "gm"), tocListStr)
        .replace(new RegExp("<!-- page list -->", "gm"), pageListStr)

    // render package.opf file

    let file_opf = Template["package.opf"];

    const imageItemStr = State.pageInfo.list.map((blobIndex, index) => {
        const blob = BlobStore.getBlobObject(blobIndex);
        const mimetype = String(blob.type);
        let str = '<item id="j' + (index + 1) + '" href="images/' + (index + 1) + '.' + mimetype.slice(6) + '" media-type="' + mimetype + '"/>';

        if (index === 0) {
            str = '<item id="cover" href="images/1.' + mimetype.slice(6) + '" media-type="' + mimetype + '"/>' + str;
        }

        return str;
    }).join('');

    const pageItemStr = State.pageInfo.list.map((blobIndex, index) => (
        '<item id="p' + (index + 1) + '" href="xhtml/p' + (index + 1) + '.xhtml" media-type="application/xhtml+xml"/>'
    )).join('');

    // let spread = State.pageInfo.firstBlankPage ? "right" : "left"; // 保留
    let spread = "right";
    const itemrefStr = State.pageInfo.list.map((b, index) => {
        spread = spread === "left" ? "right" : "left";
        return '<itemref idref="p' + (index + 1) + '" properties="page-spread-' + spread + '" />';
    }).join('');

    file_opf = file_opf
        .replace(new RegExp("{{uuid}}", "gm"), State.mangaInfo.global.uuid)
        .replace(new RegExp("{{title}}", "gm"), State.mangaInfo.global.title)
        .replace(new RegExp("{{language}}", "gm"), State.mangaInfo.global.language)
        .replace(new RegExp("{{creator}}", "gm"), State.mangaInfo.global.creator)
        .replace(new RegExp("{{subject}}", "gm"), State.mangaInfo.global.subject)
        .replace(new RegExp("{{createTime}}", "gm"), new Date().toISOString())
        .replace(new RegExp("<!-- image item -->", "gm"), imageItemStr)
        .replace(new RegExp("<!-- page.xhtml item -->", "gm"), pageItemStr)
        .replace(new RegExp("<!-- image item ref -->", "gm"), itemrefStr)

    const files_page = {};
    State.pageInfo.list.map((blobIndex, index) => {
        files_page["p" + (index + 1) + ".xhtml"] = Template['page.xhtml']
            .replace("{{language}}", State.mangaInfo.global.language)
            .replace("{{title}}", State.mangaInfo.global.title)
            .replace("{{viewport}}", "width=" + State.pageInfo.viewport.width + ",height=" + State.pageInfo.viewport.height)
            .replace("{{image file src}}", "../images/" + (index + 1) + '.' + String(BlobStore.getBlobObject(blobIndex).type).slice(6))
    });

    // Add file to zip object

    Zip.file("mimetype", Template.mimetype);
    Zip.file("META-INF/container.xml", Template["container.xml"]);

    Zip.file("OPS/css/default.css", Template["default.css"]);
    Zip.file("OPS/css/en.css", Template["en.css"]);
    Zip.file("OPS/css/ja-jp.css", Template["ja-jp.css"]);

    Zip.file("OPS/xhtml/toc.ncx", file_ncx);
    Zip.file("OPS/xhtml/toc.xhtml", file_toc_xhtml);

    Zip.file("OPS/package.opf", file_opf);

    State.pageInfo.list.map((blobIndex, index) => {
        const blob = BlobStore.getBlobObject(blobIndex);
        Zip.file("OPS/images/" + (index + 1) + "." + String(blob.type).slice(6), blob);
    });

    Object.keys(files_page).map(fileName => {
        Zip.file("OPS/xhtml/" + fileName, files_page[fileName]);
    });

    return new Promise(resolve => {
        Zip.generateAsync({
            type: "blob",
            mimeType: "application/epub+zip"
        }).then(blob => {
            const anchor = document.createElement("a");
            const objectURL = window.URL.createObjectURL(blob);

            anchor.download = State.mangaInfo.global.title.trim() + ".epub";
            // anchor.download = "manga.zip";
            anchor.href = objectURL;
            anchor.click();

            window.URL.revokeObjectURL(objectURL);
            resolve();
        });
    });
}

export default generateEPUB