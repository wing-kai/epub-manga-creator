import { makeAutoObservable, observable, action } from "mobx"

class Store {
  @observable modalAnalyzeVisible = false
  @observable modalBookVisible = false
  @observable modalContentVisible = false
  @observable modalPageVisible = false
  @observable maxCardBoxCountInOneRow = 0
  @observable selectedPageIndex: number | null = null

  fileName = ``
  firstImport = true

  constructor() {
    makeAutoObservable(this)
  }

  @action
  toggleAnalyzeVisible(fileName?: string) {
    if (fileName) {
      this.fileName = fileName
    }
    this.modalAnalyzeVisible = !this.modalAnalyzeVisible
  }

  @action
  toggleBookVisible() {
    this.firstImport = false
    this.modalBookVisible = !this.modalBookVisible
  }

  @action
  toggleContentVisible() {
    this.modalContentVisible = !this.modalContentVisible
  }

  @action
  togglePageVisible() {
    this.modalPageVisible = !this.modalPageVisible
  }

  @action
  hideModal() {
    Object.assign(this, {
      modalBookVisible: false,
      modalContentVisible: false,
      modalPageVisible: false,
    })
  }

  @action
  selectPageIndex(index: number | null) {
    if (index === null) {
      this.selectedPageIndex = null
    } else if (this.selectedPageIndex === index) {
      this.selectedPageIndex = null
    } else {
      this.selectedPageIndex = index
    }
  }
}

export default Store