import { action, makeAutoObservable, observable, toJS } from "mobx"
import uuid from 'utils/get-uuid'

export declare namespace StoreBook {
  export interface PageItem {
    index: number,
    blobID: string
    sticky: 'auto' | 'left' | 'right',
    blank: boolean
  }

  export interface BookInfoSet {
    bookTitle: string
    bookAuthors: string[]
    bookSubject: string
    bookPublisher: string
  }
}

type BookPageProperty = 'bookID' | 'bookTitle' | 'bookAuthors' | 'bookSubject' | 'bookPublisher' | 'pageSize' | 'pagePosition' | 'pageShow' | 'pageFit' | 'pageBackgroundColor' | 'pageDirection' | 'coverPosition' | 'imgTag'

class Store {
  @observable bookID: string = uuid()
  @observable bookTitle: string = ''
  @observable bookAuthors: string[] = ['']
  @observable bookSubject: string = ''
  @observable bookPublisher: string = ''

  @observable pageSize: [number, number] = [250, 353]
  @observable pagePosition: ('center' | 'between') = 'between'
  @observable pageShow: ('two' | 'one') = 'two'
  @observable pageFit: ('stretch' | 'fit' | 'fill') = 'stretch'
  @observable pageBackgroundColor: ('white' | 'black') = 'white'
  @observable pageDirection: ('right' | 'left') = 'right'
  @observable coverPosition: ('first-page' | 'alone') = 'first-page'
  @observable imgTag: ('svg' | 'img') = 'svg'

  @observable pages: StoreBook.PageItem[] = []
  @observable savedSets: StoreBook.BookInfoSet[] = []

  constructor() {
    makeAutoObservable(this)
  }

  @action
  pushNewPage(blobUUIDs: string[]) {
    const newPages: StoreBook.PageItem[] = blobUUIDs.map((uuid, index) => ({
      index,
      blobID: uuid,
      sticky: 'auto',
      blank: false
    }))

    const pages = toJS(this.pages)
    this.pages = [...pages, ...newPages]
  }

  splitPage(index: number, blobUUIDs: string[]) {
    const pages = toJS(this.pages)

    const newPageItem1: StoreBook.PageItem = {
      index,
      blobID: blobUUIDs[0],
      sticky: 'auto',
      blank: false
    }
    const newPageItem2: StoreBook.PageItem = {
      index: -1,
      blobID: blobUUIDs[1],
      sticky: 'auto',
      blank: false
    }

    pages.splice(index, 1, newPageItem1, newPageItem2)

    this.pages = pages
  }

  @action
  updateBookPageProperty(key: BookPageProperty, value: any) {
    Object.assign(this, {
      [key]: value
    })
  }

  @action
  removePage(index: number) {
    const pages = toJS(this.pages)
    pages.splice(index, 1)
    this.pages = pages
  }

  @action
  switchIndex(index: number, targetIndex: number) {
    let pages: (StoreBook.PageItem | null)[] = toJS(this.pages)
    const pageItem = pages[index]
    const maxIndex = pages.length - 1

    pages[index] = null
    const part1 = pages.slice(0, targetIndex)
    const part2 = pages.slice(targetIndex, maxIndex + 1)
    pages = [...part1, pageItem, ...part2].filter(item => item)

    this.pages = pages as StoreBook.PageItem[]
  }

  @action
  updatePageItemIndex() {
    const pages = toJS(this.pages)

    this.pages = pages.map((pageItem: StoreBook.PageItem, i: number) => {
      pageItem.index = i
      return pageItem
    })
  }

  @action
  insertBlankPage(index: number) {
    const pages = toJS(this.pages)
    const maxIndex = pages.length - 1

    const newPageItem: StoreBook.PageItem = {
      index: -1,
      blobID: '',
      sticky: 'auto',
      blank: true
    }

    if (index >= maxIndex) {
      pages.push(newPageItem)
    } else {
      const currentIndex = index < 0 ? 0 : index
      const pageItem = pages[currentIndex]
      pages.splice(currentIndex, 1, newPageItem, pageItem)
    }

    this.pages = pages
  }

  @action
  saveBookInfoToSet() {
    const newSet = {
      bookTitle: this.bookTitle,
      bookAuthors: this.bookAuthors,
      bookSubject: this.bookSubject,
      bookPublisher: this.bookPublisher,
    }

    this.savedSets.push(newSet)
  }

  @action
  removeBookInfoSet(index: number) {
    const savedSets = toJS(this.savedSets)
    savedSets.splice(index, 1)
    this.savedSets = savedSets
  }

  @action
  applySet(index: number) {
    this.bookTitle = this.savedSets[index].bookTitle
    this.bookAuthors = this.savedSets[index].bookAuthors
    this.bookSubject = this.savedSets[index].bookSubject
    this.bookPublisher = this.savedSets[index].bookPublisher
  }
}

export default Store