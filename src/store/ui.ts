import { makeAutoObservable, observable, action } from "mobx"

class Store {
  @observable modalBookVisible = false
  @observable modalContentVisible = false
  @observable modalPageVisible = false
  @observable maxCardBoxCountInOneRow = 0
  @observable selectedPageIndex: number | null = null
  @observable fileName = ``

  firstImport = true

  constructor() {
    makeAutoObservable(this)
  }

  @action
  toggleBookVisible(fileName?: string) {
    this.modalBookVisible = !this.modalBookVisible
    if (fileName && this.firstImport) {
      this.fileName = fileName
    }
  }

  @action
  firstUploaded() {
    this.firstImport = false
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