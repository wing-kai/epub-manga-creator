import { action, makeAutoObservable, observable, toJS } from "mobx"

interface ContentItem {
  pageIndex: number | null
  title: string
}

interface IndexMap { [pageIndex: string]: number }

const cloneState = function(this: Store) {
  return {
    list: toJS(this.list),
    indexMap: toJS(this.indexMap)
  }
}

class Store {
  @observable list: ContentItem[] = [{
    pageIndex: 0,
    title: '表紙'
  }]
  @observable indexMap: IndexMap = {
     0: 0
  }
  @observable savedSets: { title: string; list: ContentItem[] }[] = []

  constructor() {
    makeAutoObservable(this)
  }

  @action
  removeTitle(listIndex: number) {
    const { list, indexMap } = cloneState.call(this)

    if (list.length === 1) {
      return
    }

    const item = list[listIndex]

    list.splice(listIndex, 1)
    if (item.pageIndex && (item.pageIndex in indexMap)) {
      delete indexMap[item.pageIndex]
    }

    this.list = list
    this.indexMap = indexMap
  }

  @action
  updateList(contentItems: ContentItem[]) {
    const indexMap: IndexMap = {}

    contentItems.forEach((item, index) => {
      if (item.pageIndex !== null) {
        indexMap[item.pageIndex] = index
      }
    })

    this.list = contentItems
    this.indexMap = indexMap
  }

  @action
  setPageIndexToTitle(listIndex: number, pageIndex: number) {
    const { list, indexMap } = cloneState.call(this)

    if (indexMap[pageIndex] && indexMap[pageIndex] === listIndex) {
      return
    }

    const newIndexMap: IndexMap = {}
    const originListIndex = pageIndex in indexMap ? indexMap[pageIndex] : null

    if (originListIndex !== null) {
      list[originListIndex].pageIndex = null
    }

    list[listIndex].pageIndex = pageIndex

    list.forEach((contentItem: ContentItem, index: number) => {
      if (contentItem.pageIndex !== null) {
        newIndexMap[contentItem.pageIndex] = index
      }
    })

    this.list = list
    this.indexMap = newIndexMap
  }

  @action
  removePageIndex(listIndex: number) {
    const { list, indexMap } = cloneState.call(this)

    const item = list[listIndex]
    list[listIndex].pageIndex = null
    delete indexMap[item.pageIndex as number]

    this.list = list
    this.indexMap = indexMap
  }

  @action
  saveSet(title: string) {
    this.savedSets.push({
      title,
      list: toJS(this.list)
    })
  }

  @action
  removeSet(index: number) {
    const savedSets = toJS(this.savedSets)
    savedSets.splice(index, 1)
    this.savedSets = savedSets
  }
}

export default Store