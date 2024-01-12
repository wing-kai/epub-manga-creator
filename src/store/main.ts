import { action, autorun, makeAutoObservable, observable, toJS } from "mobx"
import uuid from 'utils/get-uuid'
import Book from 'store/book'
import Ui from 'store/ui'
import Contents from 'store/contents'
import storeBlobs, { Store as Blobs } from 'store/blobs'
import JSZip from "jszip"

import 'template/mimetype'
import getTemplateContainerXml from 'template/container.xml'
import getTemplatePageXhtml from 'template/page.xhtml'
import getTemplatePageImgXhtml from 'template/page_img.xhtml'
import getTemplateFixedLayoutJpCss from 'template/fixed-layout-jp.css'
import getTemplateStandardOpf from 'template/standard.opf'
import getTemplateNavigationDocumentsXhtml from 'template/navigation-documents.xhtml'

const htmlToEscape = (str: string): string => {
  // eslint-disable-next-line no-control-regex
  const reg = /"|&|'|\\!|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g

  return str.replace(reg, ($0) => {
    let c: any = $0.charCodeAt(0)
    let r = ['&#']

    c = (c === 0x20) ? 0xA0 : c
    r.push(c)
    r.push(';')
    return r.join('')
  })
}

const getNumberStr = (num: number, zeroCount: number): string => {
  let str = String(num)
  let i = zeroCount - str.length
  while (i-- > 0) {
    str = '0' + str
  }
  return str
}

class Store {
  @observable ui: Ui
  @observable book: Book
  @observable contents: Contents
  @observable blobs: Blobs

  constructor() {
    this.ui = new Ui()
    this.book = new Book()
    this.contents = new Contents()
    this.blobs = storeBlobs

    makeAutoObservable(this)

    try {
      const bookSets = JSON.parse(localStorage.getItem('EPUB_CREATOR_SAVED_SETS_BOOK') || '[]')
      const contentSets = JSON.parse(localStorage.getItem('EPUB_CREATOR_SAVED_SETS_CONTENTS') || '[]')

      this.book.savedSets = bookSets
      this.contents.savedSets = contentSets
    } catch {
      // do nothing
    }
  }

  @action
  importPageFromImages(fileList: File[]) {
    const uuids = fileList.map(() => uuid())

    this.book.pushNewPage(uuids)
    this.blobs.push(fileList, uuids)
  }

  @action
  replacePageIndex(index: number, targetIndex: number) {
    this.book.switchIndex(index, index > targetIndex ? targetIndex : targetIndex + 1)
    this.ui.selectPageIndex(targetIndex)

    const newIndexMap: Contents['indexMap'] = {}
    const list = toJS(this.contents.list)

    this.book.pages.forEach((pageItem, index) => {
      if (pageItem.index in this.contents.indexMap) {
        const listIndex = this.contents.indexMap[pageItem.index]
        newIndexMap[index] = listIndex
        list[listIndex].pageIndex = index
      }
    })

    this.contents.updateList(list)
    this.book.updatePageItemIndex()
  }

  @action
  async splitPage(index: number) {
    const pageItem = this.book.pages[index]
    const blobItem = this.blobs.blobs[pageItem.blobID]
    const uuids = [uuid(), uuid()]
    const mime = blobItem.blob.type

    const w1 = blobItem.originImage.width >> 1
    const w2 = blobItem.originImage.width - w1

    const canvas1 = document.createElement('canvas')
    const canvas2 = document.createElement('canvas')

    canvas1.width = w1
    canvas1.height = blobItem.originImage.height

    canvas2.width = w2
    canvas2.height = blobItem.originImage.height

    const ctx1 = canvas1.getContext('2d')
    const ctx2 = canvas2.getContext('2d')

    ctx1?.drawImage(blobItem.originImage, 0, 0)
    ctx2?.drawImage(blobItem.originImage, 0 - w1, 0)

    const blobs = await Promise.all([
      new Promise<Blob>((resolve, reject) =>
        canvas1.toBlob(
          (blob) => blob ? resolve(blob) : reject(),
          mime, 1
        )
      ),
      new Promise<Blob>((resolve, reject) =>
        canvas2.toBlob(
          (blob) => blob ? resolve(blob) : reject(),
          mime, 1
        )
      ),
    ])

    this.book.splitPage(index, uuids)
    this.book.updatePageItemIndex()
    this.blobs.push(blobs, this.book.pageDirection === 'left' ? uuids : uuids.reverse())

    const list = toJS(this.contents.list)
    list.forEach(contentItem => {
      if (contentItem.pageIndex === null) {
        return
      }
      if (contentItem.pageIndex > index) {
        contentItem.pageIndex++
      }
    })

    this.contents.updateList(list)
  }

  @action
  insertBlankPage(index: number) {
    this.book.insertBlankPage(index)
    this.book.updatePageItemIndex()

    const selectedPageIndex = this.ui.selectedPageIndex
    if (selectedPageIndex && (selectedPageIndex >= index)) {
      this.ui.selectPageIndex(selectedPageIndex + 1)
    }

    const list = toJS(this.contents.list)
    list.forEach(contentItem => {
      if (contentItem.pageIndex === null) {
        return
      }
      if (contentItem.pageIndex > index) {
        contentItem.pageIndex++
      }
    })

    this.contents.updateList(list)
  }

  @action
  removePage(index: number) {
    this.book.removePage(index)
    this.ui.selectPageIndex(null)

    const list = toJS(this.contents.list)
    list.forEach((contentItem) => {
      if (contentItem.pageIndex === null) {
        return
      }
      if (contentItem.pageIndex === index) {
        contentItem.pageIndex = null
        return
      }
      if (contentItem.pageIndex > index) {
        contentItem.pageIndex--
      }
    })

    this.contents.updateList(list)
  }

  @action
  generateBook() {
    let templateContainerXml = getTemplateContainerXml()
    let templatePageXhtml = getTemplatePageXhtml()
    let templatePageImgXhtml = getTemplatePageImgXhtml()
    let templateFixedLayoutJpCss = getTemplateFixedLayoutJpCss()
    let templateStandardOpf = getTemplateStandardOpf()
    let templateNavigationDocumentsXhtml = getTemplateNavigationDocumentsXhtml()

    const Zip = new JSZip()

    Zip.folder('META-INF')
    Zip.folder('OEBPS/image')
    Zip.folder('OEBPS/text')
    Zip.folder('OEBPS/style')

    templateNavigationDocumentsXhtml = templateNavigationDocumentsXhtml.replace(
      '<!-- navigation-list -->',
      Object.keys(this.contents.indexMap).map((pageIndex) => {
        const listIndex = this.contents.indexMap[pageIndex]
        const contentItem = this.contents.list[listIndex]
        const title = htmlToEscape(contentItem.title)
  
        if (pageIndex === '0') {
          return `<li><a href="text/p_cover.xhtml">${title}</a></li>`
        }
  
        return `<li><a href="text/p_${getNumberStr(+pageIndex - 1, 4)}.xhtml">${title}</a></li>`
      }).join('\n')
    )

    let imageItemStr: string[] = []
    let pageItemStr: string[] = []
    let itemRefStr: string[] = []
    let spread = this.book.coverPosition === 'first-page'
      ? this.book.pageDirection
      : this.book.pageDirection === 'left'
        ? 'right'
        : 'left'

    this.book.pages.forEach((pageItem, i) => {
      const numStr = i === 0 ? 'cover' : getNumberStr(i - 1, 4)
      const imageFileName = (i === 0 ? '' : 'i_') + numStr

      if (pageItem.blank) {
        pageItemStr.push(`<item id="p_${numStr}" href="text/p_${numStr}.xhtml" media-type="application/xhtml+xml" properties="svg"></item>`)
      } else {
        const mimeType = this.blobs.blobs[pageItem.blobID].blob.type // image/xxxxx
        pageItemStr.push(`<item id="p_${numStr}" href="text/p_${numStr}.xhtml" media-type="application/xhtml+xml" properties="svg" fallback="${imageFileName}"></item>`)
        imageItemStr.push(`<item id="${imageFileName}" href="image/${imageFileName}.${mimeType.slice(6)}" media-type="${mimeType}"${i === 0 ? ' properties="cover-image"' : ''}></item>`)
      }

      if (i !== 0) {
        itemRefStr.push(`<itemref linear="yes" idref="p_${numStr}" properties="page-spread-${spread}"></itemref>`)
        spread = spread === 'left' ? 'right' : 'left'
      }
    })

    if (this.book.coverPosition === 'alone') {
      pageItemStr.splice(0, 1)
    } else { // this.book.coverPosition === 'first-page'
      itemRefStr.unshift(`<itemref linear="yes" idref="p_cover" properties="rendition:page-spread-center"></itemref>`)
    }

    const viewPortWidth = this.book.pageSize[0] + ''
    const viewPortHeight = this.book.pageSize[1] + ''
    const fitMode = this.book.pageFit
    const bookTitle = htmlToEscape(this.book.bookTitle.trim())

    if (this.book.imgTag === 'svg') {
      this.book.pages.forEach((pageItem, i) => {
        const numStr = i === 0 ? 'cover' : getNumberStr(i - 1, 4)
        const blob = this.blobs.blobs[pageItem.blobID].blob
        const mimeType = blob.type.slice(6)
        const imageFileName = (i === 0 ? '' : 'i_') + numStr + '.' + mimeType
  
        if (pageItem.blank) {
          Zip.file(
            `OEBPS/text/p_${numStr}.xhtml`,
            templatePageXhtml
              .replace('{{title}}', bookTitle)
              .replace(new RegExp('{{width}}', 'gm'), viewPortWidth)
              .replace(new RegExp('{{height}}', 'gm'), viewPortHeight)
              .replace('{{image}}', '')
          )
          return
        }
  
        let par = 'none'
        if (fitMode !== 'stretch') {
          par = this.book.pagePosition === 'center'
            ? 'xMidYMid '
            : this.book.pageDirection === 'left'
              ? (i + 1) % 2 === 1 ? 'xMaxYMid ' : 'xMinYMid '
              : (i + 1) % 2 === 1 ? 'xMinYMid ' : 'xMaxYMid '
      
          if (fitMode === 'fit') {
            par += 'meet'
          } else { // props.imageFit === 'fill'
            par += 'slice'
          }
        }
  
        Zip.file(
          `OEBPS/text/p_${numStr}.xhtml`,
          templatePageXhtml
            .replace('{{title}}', bookTitle)
            .replace(new RegExp('{{width}}', 'gm'), viewPortWidth)
            .replace(new RegExp('{{height}}', 'gm'), viewPortHeight)
            .replace('{{image}}', `<image width="100%" height="100%" preserveAspectRatio="${par}" xlink:href="../image/${imageFileName}" />`)
        )
  
        Zip.file(`OEBPS/image/${imageFileName}`, blob)
      })
    } else { // this.book.imgTag === 'img'
      this.book.pages.forEach((pageItem, i) => {
        const numStr = i === 0 ? 'cover' : getNumberStr(i - 1, 4)
        const blob = this.blobs.blobs[pageItem.blobID].blob
        const mimeType = blob.type.slice(6)
        const imageFileName = (i === 0 ? '' : 'i_') + numStr + '.' + mimeType

        if (pageItem.blank) {
          Zip.file(
            `OEBPS/text/p_${numStr}.xhtml`,
            templatePageImgXhtml
              .replace('{{title}}', bookTitle)
              .replace(new RegExp('{{width}}', 'gm'), viewPortWidth)
              .replace(new RegExp('{{height}}', 'gm'), viewPortHeight)
              .replace(`<img src="{{imageSource}}" style="{{style}}"/>`, '<div style="width:100%;height:100%;"></div>')
          )
          return
        }

        let imgStyle = 'object-fit:fill'
        if (fitMode !== 'stretch') {
          imgStyle = 'object-position:'

          imgStyle += (
            this.book.pagePosition === 'center'
              ? 'center;'
              : this.book.pageDirection === 'left'
                ? (i + 1) % 2 === 1 ? 'right;' : 'left;'
                : (i + 1) % 2 === 1 ? 'left;' : 'right;'
          )

          if (fitMode === 'fit') {
            imgStyle += 'object-fit:contain'
          } else { // props.imageFit === 'fill'
            imgStyle += 'object-fit:cover'
          }
        }

        Zip.file(
          `OEBPS/text/p_${numStr}.xhtml`,
          templatePageImgXhtml
            .replace('{{title}}', bookTitle)
            .replace(new RegExp('{{width}}', 'gm'), viewPortWidth)
            .replace(new RegExp('{{height}}', 'gm'), viewPortHeight)
            .replace('{{imageSource}}', `../image/${imageFileName}`)
            .replace('{{style}}', imgStyle)
        )
  
        Zip.file(`OEBPS/image/${imageFileName}`, blob)
      })
    }

    let authorsStr = this.book.bookAuthors.map((name, i) => {
      return [
        `<dc:creator id="creator${i + 1}">${htmlToEscape(name)}</dc:creator>`,
        `<meta refines="#creator${i + 1}" property="role" scheme="marc:relators">aut</meta>`,
        `<meta refines="#creator${i + 1}" property="file-as"></meta>`,
        `<meta refines="#creator${i + 1}" property="display-seq">${i + 1}</meta>`
      ].join('\n')
    }).join('\n')

    templateStandardOpf = templateStandardOpf
      .replace('{{uuid}}', this.book.bookID)
      .replace('{{title}}', bookTitle)
      .replace('<!-- creator-list -->', authorsStr)
      .replace('{{subject}}', htmlToEscape(this.book.bookSubject))
      .replace('{{publisher}}', htmlToEscape(this.book.bookPublisher))
      .replace('{{spread}}', this.book.pageShow === 'one' ? 'none' : 'landscape')
      .replace('{{createTime}}', new Date().toISOString())
      .replace(new RegExp('{{width}}', 'gm'), viewPortWidth)
      .replace(new RegExp('{{height}}', 'gm'), viewPortHeight)
      .replace('<!-- item-image -->', imageItemStr.join('\n'))
      .replace('<!-- item-xhtml -->', pageItemStr.join('\n'))
      .replace('<!-- itemref-xhtml -->', itemRefStr.join('\n'))
      .replace('{{direction}}', this.book.pageDirection === 'right' ? ' page-progression-direction="rtl"' : '')

    Zip.file('mimetype', 'application/epub+zip')
    Zip.file('META-INF/container.xml', templateContainerXml)
    Zip.file('OEBPS/style/fixed-layout-jp.css', templateFixedLayoutJpCss)
    Zip.file('OEBPS/navigation-documents.xhtml', templateNavigationDocumentsXhtml)
    Zip.file('OEBPS/standard.opf', templateStandardOpf)

    Zip.generateAsync({
      type: 'blob',
      mimeType: 'application/epub+zip'
    }).then(blob => {
      const anchor = document.createElement('a')
      const objectURL = window.URL.createObjectURL(blob)
      anchor.download = this.book.bookTitle.trim() + '.epub'
      anchor.href = objectURL
      anchor.click()
      window.URL.revokeObjectURL(objectURL)
    })
  }
}

const store = new Store()

autorun(() => {
  localStorage.setItem('EPUB_CREATOR_SAVED_SETS_BOOK', JSON.stringify(toJS(store.book.savedSets)))
  localStorage.setItem('EPUB_CREATOR_SAVED_SETS_CONTENTS', JSON.stringify(toJS(store.contents.savedSets)))
})

export default store