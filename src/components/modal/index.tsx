import React, { FormEvent, useCallback, useEffect, useState } from 'react'
import storeMain from 'store/main'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import deepClone from 'utils/deep-clone'
import Icon from 'components/icon'

import 'components/modal/index.css'

const PAGE_SIZE: { [name: string]: () => [number, number] } = {
  'B4': () => [1250, 1765],
  'B5': () => [880, 1250],
  'A4': () => [1050, 1485],
  'A5': () => [1480, 2100],
  'CG 16:9': () => [1600, 900],
  'CG 16:10': () => [1600, 1000],
}

const KeywordPicker = function(props: { keywords: string[], onClick: (str: string) => void }) {
  const onClick = useCallback((e: FormEvent<HTMLButtonElement>) => {
    const index = e.currentTarget.dataset.index as string

    props.onClick(props.keywords[+index])
  }, [props])

  return (
    <>
      {
        props.keywords.map((str, index) =>
          <button
            type="button"
            key={index}
            data-index={index}
            className="btn btn-outline-primary btn-sm me-2"
            onClick={onClick}
          >{str}</button>
        )
      }
    </>
  )
}

const ModalBook = observer(function() {
  const storeUI = React.useContext(React.createContext(storeMain.ui))
  const storeBook = React.useContext(React.createContext(storeMain.book))
  const setsSeletRef = React.useRef<HTMLSelectElement>(null)

  const [fileName, setFileName] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [selectedSetIndex, setSelectedSetIndex] = useState(-1)

  const keywordsLength = keywords.length

  const onClickModal = useCallback((e) => {
    e.stopPropagation()
    return
  }, [])
  const onClickClose = useCallback(() => {
    storeUI.toggleBookVisible()
  }, [storeUI])

  const onClickAnalyze = useCallback(() => {
    const reg = [
      /\[.*?\(.*\)\]/, // [xxx(xxx)]
      /\[.*?\]\s?\[.*?\]/, // [xxx][xxx]
      /\[.*?\]/, // [xxx]
      /\(.*?\)/, // (xxx)
      /\([^[\]()]*?\)|\[[^[\]()]*?\]/g,
    ]

    let suffix0 = reg[0].exec(fileName)
    let suffix1 = reg[1].exec(fileName)
    let suffix2 = reg[2].exec(fileName)
    let suffix3 = reg[3].exec(fileName)

    if (suffix0) {
      let suffix = suffix0[0]
      let author = Array.from(suffix.match(/\(.*?\)/g) || []).pop()
      const i = fileName.indexOf(suffix[0])
      const titleAndPrefix = fileName.slice(i === 0 ? suffix.length : i + suffix.length).trim()

      storeBook.updateBookPageProperty('bookTitle', titleAndPrefix)
      storeBook.updateBookPageProperty('bookAuthors', [author?.slice(1, -1)?.trim() || ''])
      setKeywords(Array.from(fileName.match(reg[4]) || []).map(str => str.slice(1, -1)))
      return
    }

    if (suffix1) {
      let suffix = suffix1[0]
      let author = Array.from(suffix.match(/\[.*?\]/g) || []).pop()
      const i = fileName.indexOf(suffix[0])
      const titleAndPrefix = fileName.slice(i === 0 ? suffix.length : i + suffix.length).trim()

      storeBook.updateBookPageProperty('bookTitle', titleAndPrefix)
      storeBook.updateBookPageProperty('bookAuthors', [author?.slice(1, -1)?.trim() || ''])
      setKeywords(Array.from(fileName.match(reg[4]) || []).map(str => str.slice(1, -1)))
      return
    }

    if (suffix2) {
      let suffix = suffix2[0]
      let author = suffix.slice(1, -1)
      const i = fileName.indexOf(suffix[0])
      const titleAndPrefix = fileName.slice(i === 0 ? suffix.length : i + suffix.length).trim()

      storeBook.updateBookPageProperty('bookTitle', titleAndPrefix)
      storeBook.updateBookPageProperty('bookAuthors', [author])
      setKeywords(Array.from(fileName.match(reg[4]) || []).map(str => str.slice(1, -1)))
      return
    }

    if (suffix3) {
      let suffix = suffix3[0]
      let author = suffix.slice(1, -1)
      const i = fileName.indexOf(suffix[0])
      const titleAndPrefix = fileName.slice(i === 0 ? suffix.length : i + suffix.length).trim()

      storeBook.updateBookPageProperty('bookTitle', titleAndPrefix)
      storeBook.updateBookPageProperty('bookAuthors', [author])
      setKeywords(Array.from(fileName.match(reg[4]) || []).map(str => str.slice(1, -1)))
      return
    }

    storeBook.updateBookPageProperty('bookTitle', fileName)
    setKeywords(Array.from(fileName.match(reg[4]) || []).map(str => str.slice(1, -1)))
  }, [storeBook, fileName])

  const onChangeFileName = useCallback((e: FormEvent<HTMLInputElement>) => {
    console.log(e.currentTarget.value)
    setFileName(e.currentTarget.value)
  }, [])
  const onChangeBookID = useCallback((e: FormEvent) => {
    const eventTarget = e.currentTarget as HTMLInputElement
    storeBook.updateBookPageProperty('bookID', eventTarget.value)
  }, [storeBook])
  const onChangeBookTitle = useCallback((e: FormEvent<HTMLInputElement>) => {
    storeBook.updateBookPageProperty('bookTitle', e.currentTarget.value)
  }, [storeBook])
  const onAddAuthor = useCallback((e: FormEvent) => {
    const eventTarget = e.currentTarget as HTMLInputElement
    const index = eventTarget.dataset.index as string
    const newValue = [...toJS(storeBook.bookAuthors)]
    newValue.splice(+index, 1, newValue[+index], '')
    storeBook.updateBookPageProperty('bookAuthors', newValue)
  }, [storeBook])
  const onRemoveAuthor = useCallback((e: FormEvent) => {
    const eventTarget = e.currentTarget as HTMLInputElement
    const index = eventTarget.dataset.index as string
    const newValue = [...toJS(storeBook.bookAuthors)]
    newValue.splice(+index, 1)
    storeBook.updateBookPageProperty('bookAuthors', newValue)
  }, [storeBook])
  const onChangeBookAuthors = useCallback((e: FormEvent) => {
    const eventTarget = e.currentTarget as HTMLInputElement
    const index = eventTarget.dataset.index as string
    const newValue = [...toJS(storeBook.bookAuthors)]
    newValue.splice(+index, 1, eventTarget.value)
    storeBook.updateBookPageProperty('bookAuthors', newValue)
  }, [storeBook])
  const onChangeBookSubject = useCallback((e: FormEvent) => {
    const eventTarget = e.currentTarget as HTMLInputElement
    storeBook.updateBookPageProperty('bookSubject', eventTarget.value)
  }, [storeBook])
  const onChangeBookPublisher = useCallback((e: FormEvent) => {
    const eventTarget = e.currentTarget as HTMLInputElement
    storeBook.updateBookPageProperty('bookPublisher', eventTarget.value)
  }, [storeBook])

  const onChangeTitleFromPicker = useCallback((value: string) => {
    storeBook.updateBookPageProperty('bookTitle', value)
  }, [storeBook])
  const onChangeAuthorsFromPicker = useCallback((value: string) => {
    const authors = toJS(storeBook.bookAuthors)

    if (authors.slice(-1)[0] === '') {
      authors[authors.length - 1] = value
    } else {
      authors.push(value)
    }

    storeBook.updateBookPageProperty('bookAuthors', authors)
  }, [storeBook])
  const onChangePublisherFromPicker = useCallback((value: string) => {
    storeBook.updateBookPageProperty('bookPublisher', value)
  }, [storeBook])

  const onClickModalBody = useCallback(() => {
    setSelectedSetIndex(-1)
  }, [])

  const onClickSaveSet = useCallback(() => {
    storeBook.saveBookInfoToSet()
    setSelectedSetIndex(-1)
    setTimeout(() => {
      if (setsSeletRef.current) {
        setsSeletRef.current.value = '-1'
      }
    }, 0)
  }, [storeBook])

  const onClickRemoveSet = useCallback(() => {
    storeBook.removeBookInfoSet(selectedSetIndex)
    setSelectedSetIndex(-1)
    setTimeout(() => {
      if (setsSeletRef.current) {
        setsSeletRef.current.value = '-1'
      }
    }, 0)
  }, [selectedSetIndex, storeBook])

  const onApplySet = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = +e.currentTarget.value
    setSelectedSetIndex(index)
    storeBook.applySet(index)
  }, [storeBook])

  useEffect(() => {
    setFileName(storeUI.fileName)
  }, [storeUI.fileName])

  useEffect(() => {
    if (fileName && storeUI.firstImport) {
      onClickAnalyze()
      storeUI.firstUploaded()
    }
  }, [fileName, onClickAnalyze, storeUI])

  useEffect(() => {
    if (selectedSetIndex !== -1) {
      return
    }
    setTimeout(() => {
      if (setsSeletRef.current) {
        setsSeletRef.current.value = selectedSetIndex + ''
      }
    }, 0)
  })

  return (
    <div className="modal-dialog modal-lg" onClick={onClickModal}>
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Book</h5>
          <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={onClickClose}></button>
        </div>
        <div className="modal-body" onClick={onClickModalBody}>
          <div className="mb-3 row">
            <label htmlFor="input-filename" className="col-sm-2 col-form-label text-end">filename</label>
            <div className="col-sm-10">
              <div className="input-group">
                <input type="text" className="form-control" id="input-filename" value={fileName} onInput={onChangeFileName}/>
                <button
                  className="btn btn-outline-secondary d-flex justify-content-center align-items-center"
                  type="button"
                  onClick={onClickAnalyze}
                >
                  <Icon name="rocket"></Icon>
                </button>
              </div>
            </div>
          </div>
          <div className="mb-3 row">
            <label htmlFor="input-book-id" className="col-sm-2 col-form-label text-end">id</label>
            <div className="col-sm-10">
              <input type="text" className="form-control" id="input-book-id" value={storeBook.bookID} onInput={onChangeBookID}/>
            </div>
          </div>
          <div className="mb-3 row">
            <label htmlFor="input-book-title" className="col-sm-2 col-form-label text-end">title</label>
            <div className="col-sm-10">
              <input type="text" className="form-control" id="input-book-title" value={storeBook.bookTitle} onInput={onChangeBookTitle}/>
              <div className={keywordsLength ? "mt-3" : ''}>
                <KeywordPicker keywords={keywords} onClick={onChangeTitleFromPicker}/>
              </div>
            </div>
          </div>
          <div className="mb-3 row">
            <label htmlFor="input-book-author" className="col-sm-2 col-form-label text-end">author</label>
            <div className="col-sm-10">
              {
                storeBook.bookAuthors.map((name: string, index: number) => (
                  <div key={index} className={"input-group" + ((index + 1) === storeBook.bookAuthors.length ? '' : ' mb-3')}>
                    <input type="text" className="form-control" data-index={index} value={name} onInput={onChangeBookAuthors}/>
                    <button
                      className="btn btn-outline-secondary d-flex justify-content-center align-items-center"
                      type="button"
                      data-index={index}
                      onClick={onAddAuthor}
                    >
                      <Icon name="plus"></Icon>
                    </button>
                    <button
                      className="btn btn-outline-secondary d-flex justify-content-center align-items-center"
                      type="button"
                      data-index={index}
                      disabled={storeBook.bookAuthors.length === 1}
                      onClick={onRemoveAuthor}
                    >
                      <Icon name="minus"></Icon>
                    </button>
                  </div>
                ))
              }
              <div className={keywordsLength ? "mt-3" : ''}>
                <KeywordPicker keywords={keywords} onClick={onChangeAuthorsFromPicker}/>
              </div>
            </div>
          </div>
          <div className="mb-3 row">
            <label htmlFor="input-book-subject" className="col-sm-2 col-form-label text-end">subject</label>
            <div className="col-sm-10">
              <input type="text" className="form-control" list="dl-subject" id="input-book-subject" value={storeBook.bookSubject} onInput={onChangeBookSubject}/>
              <datalist id="dl-subject">
                <option value="少年" />
                <option value="少女" />
                <option value="青年" />
                <option value="同人誌" />
                <option value="漫画" />
                <option value="成年コミック" />
              </datalist>
            </div>
          </div>
          <div className="mb-3 row">
            <label htmlFor="input-book-publisher" className="col-sm-2 col-form-label text-end">publisher</label>
            <div className="col-sm-10">
              <input type="text" className="form-control" list="dl-publisher" id="input-book-publisher" value={storeBook.bookPublisher} onInput={onChangeBookPublisher}/>
              <datalist id="dl-publisher">
                <option value="KADOKAWA" />
                <option value="講談社" />
                <option value="集英社" />
                <option value="小学館" />
                <option value="小学館集英社プロダクション" />
                <option value="少年画報社" />
                <option value="松文館" />
                <option value="日本文芸社" />
                <option value="白泉社" />
                <option value="芳文社" />
                <option value="ワニマガジン社" />
                <option value="FAKKU" />
              </datalist>
              <div className={keywordsLength ? "mt-3" : ''}>
                <KeywordPicker keywords={keywords} onClick={onChangePublisherFromPicker}/>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer justify-content-start">
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={onClickSaveSet}>save set</button>
          <select className="form-select form-select-sm" value={selectedSetIndex + ''} defaultChecked={false} ref={setsSeletRef} style={{width: '200px'}} onChange={onApplySet}>
            {
              storeBook.savedSets.map((set, index) =>
                <option defaultChecked={false} key={index} value={index}>title: {set.bookTitle}, author: {set.bookAuthors[0]}, subject: {set.bookSubject}</option>
              )
            }
          </select>
          <button type="button" disabled={selectedSetIndex === -1} className="btn btn-sm btn-outline-danger" onClick={onClickRemoveSet}>remove set</button>
        </div>
      </div>
    </div>
  )
})

const ModalContents = observer(function() {
  const store = React.useContext(React.createContext(storeMain.ui))
  const setsSeletRef = React.useRef<HTMLSelectElement>(null)
  const [plainMode, setPlainMode] = useState(false)
  const [tempList, setTempList] = useState<typeof storeMain.contents.list>([])
  const [textAreaInput, setTextAreaInput] = useState('')
  const [selectedSetIndex, setSelectedSetIndex] = useState(-1)
  const maxIndex = tempList.length - 1

  const onClickModal = useCallback((e) => {
    e.stopPropagation()
    return
  }, [])

  const onClickClose = useCallback(() => {
    store.toggleContentVisible()
  }, [store])

  const togglePlainMode = useCallback(() => {
    if (plainMode) {
      const list: typeof storeMain.contents.list = []
      const items = textAreaInput.split('\n')
      items.forEach(item => {
        const [pageIndex, ...title] = item.split('. ')

        if (!isNaN(pageIndex as any) && title.length) {
          list.push({
            pageIndex: Math.abs(+pageIndex - 1),
            title: title.join('')
          })
        } else {
          list.push({
            pageIndex: 998,
            title: pageIndex
          })
        }
      })

      setTempList(list)
    } else {
      let value = tempList.map(contentItem => {
        return ((contentItem.pageIndex || 0) + 1) + '. ' + contentItem.title
      }).join('\n')

      setTextAreaInput(value)
    }

    setPlainMode(!plainMode)
  }, [tempList, plainMode, textAreaInput])

  const onInputPageIndex = useCallback((e: FormEvent<HTMLInputElement>) => {
    const listIndex = +(e.currentTarget.dataset.index as string)
    const value = e.currentTarget.value as string
    const newList = deepClone(tempList) as typeof storeMain.contents.list
    const item = newList[listIndex]
    item.pageIndex = (+value - 1) || 0
    setTempList(newList)
  }, [tempList])

  const onInputTitle = useCallback((e: FormEvent<HTMLInputElement>) => {
    const listIndex = +(e.currentTarget.dataset.index as string)
    const value = e.currentTarget.value as string
    const newList = deepClone(tempList) as typeof storeMain.contents.list
    const item = newList[listIndex]
    item.title = value
    setTempList(newList)
  }, [tempList])

  const onClickAdd = useCallback((e: FormEvent<HTMLButtonElement>) => {
    const listIndex = +(e.currentTarget.dataset.index as string)
    const list = deepClone(tempList) as typeof storeMain.contents.list
    const item = list[listIndex]
    list.splice(listIndex, 1, item, {
      pageIndex: 0,
      title: ''
    })
    setTempList(list)
  }, [tempList])

  const onClickRemove = useCallback((e: FormEvent<HTMLButtonElement>) => {
    const listIndex = +(e.currentTarget.dataset.index as string)
    const list = deepClone(tempList) as typeof storeMain.contents.list
    list.splice(listIndex, 1)
    setTempList(list)
  }, [tempList])

  const onSortList = useCallback(() => {
    const list = deepClone(tempList) as typeof storeMain.contents.list

    list.sort((a, b) => {
      if (isNaN(a.pageIndex as number)) {
        return 1
      }
      if (isNaN(b.pageIndex as number)) {
        return 1
      }
      return (a.pageIndex as number) - (b.pageIndex as number)
    })

    setTempList(list)
  }, [tempList])

  const onFocusNumberInput = useCallback((e: FormEvent<HTMLInputElement>) => {
    e.currentTarget.select()
  }, [])

  const onTextareaInput = useCallback((e: FormEvent<HTMLTextAreaElement>) => {
    setTextAreaInput(e.currentTarget.value)
  }, [])

  const onSave = useCallback(() => {
    storeMain.contents.updateList(tempList)
    store.toggleContentVisible()
  }, [store, tempList])

  const onClickSaveSet = useCallback(() => {
    storeMain.contents.saveSet(storeMain.book.bookTitle)
    setSelectedSetIndex(-1)
    setTimeout(() => {
      if (setsSeletRef.current) {
        setsSeletRef.current.value = '-1'
      }
    }, 0)
  }, [])

  const onClickRemoveSet = useCallback(() => {
    storeMain.contents.removeSet(selectedSetIndex)
    setSelectedSetIndex(-1)
    setTimeout(() => {
      if (setsSeletRef.current) {
        setsSeletRef.current.value = '-1'
      }
    }, 0)
  }, [selectedSetIndex])

  const onApplySet = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = +e.currentTarget.value
    setSelectedSetIndex(index)
    setTempList(toJS(storeMain.contents.savedSets[index].list))
  }, [])

  const onClickModalBody = useCallback(() => {
    setSelectedSetIndex(-1)
  }, [])

  useEffect(() => {
    if (selectedSetIndex !== -1) {
      return
    }
    setTimeout(() => {
      if (setsSeletRef.current) {
        setsSeletRef.current.value = selectedSetIndex + ''
      }
    }, 0)
  })

  useEffect(() => {
    if (store.modalContentVisible) {
      setTempList(toJS(storeMain.contents.list))
    }
  }, [store.modalContentVisible])

  return (
    <div className="modal-dialog modal-lg" onClick={onClickModal}>
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Content</h5>
          <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={onClickClose}></button>
        </div>
        <div className="modal-body" onClick={onClickModalBody}>
          {
            plainMode ? (
              <textarea
                cols={30}
                rows={10}
                placeholder="eg: \n 1. cover \n 2. xxxx \n 3.xxxx"
                className="form-control"
                style={{resize: 'none'}}
                value={textAreaInput}
                onInput={onTextareaInput}
              />
            ) : (
              <>
                <div className="row mb-2">
                  <div className="col-2">
                    <h6>index</h6>
                  </div>
                  <div className="col-6">
                    <h6>title</h6>
                  </div>
                  <div className="col-auto"></div>
                </div>
                {
                  tempList.map((contentItem, index) => (
                    <div className={'row mb-' + (index === maxIndex ? '2' : '4')} key={index}>
                      <div className="col-2">
                        <input
                          type="number"
                          className="form-control"
                          data-index={index}
                          value={(contentItem.pageIndex || 0) + 1}
                          onFocus={onFocusNumberInput}
                          onInput={onInputPageIndex}
                        />
                      </div>
                      <div className="col-8">
                        <input type="text" className="form-control" data-index={index} value={contentItem.title} onInput={onInputTitle}/>
                      </div>
                      <div className="col-auto">
                        <div className="btn-group" role="group" aria-label="Basic example">
                          <button type="button" className="btn btn btn-secondary d-flex justify-content-center align-items-center" data-index={index} onClick={onClickAdd}>
                            <Icon name="plus"></Icon>
                          </button>
                          <button type="button" className="btn btn btn-secondary d-flex justify-content-center align-items-center" data-index={index} onClick={onClickRemove}>
                            <Icon name="minus"></Icon>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </>
            )
          }
        </div>
        {
          plainMode ? null : (
            <div className="modal-footer justify-content-start">
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={onClickSaveSet}>save set</button>
              <select className="form-select form-select-sm" key={selectedSetIndex} value={selectedSetIndex + ''} defaultChecked={false} ref={setsSeletRef} style={{width: '200px'}} onChange={onApplySet}>
                {
                  storeMain.contents.savedSets.map((set, index) =>
                    <option defaultChecked={false} key={index} value={index}>{set.title}</option>
                  )
                }
              </select>
              <button type="button" disabled={selectedSetIndex === -1} className="btn btn-sm btn-outline-danger" onClick={onClickRemoveSet}>remove set</button>
            </div>
          )
        }
        <div className="modal-footer justify-content-start">
          <button type="button" className="btn btn-outline-primary" onClick={togglePlainMode}>
            {plainMode ? 'form mode' : 'plain text mode'}
          </button>
          <button type="button" disabled={plainMode} className="btn btn-outline-primary me-auto" onClick={onSortList}>
            sort
          </button>
          <button type="button" disabled={plainMode} className="btn btn-primary" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
})

const ButtonRadio = function(props: { value: any; current: any; label: string; onClick: (val: any) => void }) {
  const onClick = useCallback(() => {
    props.onClick(props.value)
  }, [props])

  const className = props.value === props.current
    ? 'btn btn-sm btn-primary me-2'
    : 'btn btn-sm btn-outline-primary me-2'

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
    >{props.label}</button>
  )
}

const ModalPage = observer(function() {
  const store = React.useContext(React.createContext(storeMain.ui))
  const storeBook = React.useContext(React.createContext(storeMain.book))

  const onClickModal = useCallback((e) => {
    e.stopPropagation()
    return
  }, [])

  const onClickClose = useCallback(() => {
    store.togglePageVisible()
  }, [store])

  const onChangePageWidth = useCallback((e: FormEvent<HTMLInputElement>) => {
    storeBook.updateBookPageProperty('pageSize', [
      +e.currentTarget.value || 1,
      storeBook.pageSize[1]
    ])
  }, [storeBook])
  const onChangePageHeight = useCallback((e: FormEvent<HTMLInputElement>) => {
    storeBook.updateBookPageProperty('pageSize', [
      storeBook.pageSize[0],
      +e.currentTarget.value || 1
    ])
  }, [storeBook])
  const onSwitchPageSize = useCallback(() => {
    storeBook.updateBookPageProperty('pageSize', [
      storeBook.pageSize[1],
      storeBook.pageSize[0]
    ])
  }, [storeBook])
  const onChangeSizeWithDefaultValue = useCallback((key: string) => {
    let func = PAGE_SIZE[key]
    storeBook.updateBookPageProperty('pageSize', func())
  }, [storeBook])
  const onChangePagePosition = useCallback((value) => {
    storeBook.updateBookPageProperty('pagePosition', value)
  }, [storeBook])
  const onChangePageShow = useCallback((value) => {
    storeBook.updateBookPageProperty('pageShow', value)
  }, [storeBook])
  const onChangePageFit = useCallback((value) => {
    storeBook.updateBookPageProperty('pageFit', value)
  }, [storeBook])
  // const onChangePageBackgroundColor = useCallback((value) => {
  //   storeBook.updateBookPageProperty('pageBackgroundColor', value)
  // }, [storeBook])
  const onChangePageDirection = useCallback((value) => {
    storeBook.updateBookPageProperty('pageDirection', value)
  }, [storeBook])
  const onChangeCoverPosition = useCallback((value) => {
    storeBook.updateBookPageProperty('coverPosition', value)
  }, [storeBook])
  const onChangeImageTag = useCallback((value) => {
    storeBook.updateBookPageProperty('imgTag', value)
  }, [storeBook])

  return (
    <div className="modal-dialog modal-md" onClick={onClickModal}>
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Page</h5>
          <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={onClickClose}></button>
        </div>
        <div className="modal-body">
          <div className="mb-2 row">
            <label className="col-3 col-form-label text-end">size</label>
            <div className="col-9 d-flex align-items-center">
              <div className="row justify-content-between">
                <div className="col-5 d-flex align-items-center">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">w</span>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      max="9999"
                      value={storeBook.pageSize[0]}
                      onInput={onChangePageWidth}
                    />
                  </div>
                </div>
                <div className="col-2 d-flex justify-content-center">
                  <button type="button" className="btn btn-sm btn-secondary d-flex justify-content-center align-items-center" onClick={onSwitchPageSize}>
                    <Icon name="cycle"/>
                  </button>
                </div>
                <div className="col-5 d-flex align-items-center">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">h</span>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      max="9999"
                      value={storeBook.pageSize[1]}
                      onInput={onChangePageHeight}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-2 row">
            <div className="col-3"></div>
            <div className="col-9 d-flex align-items-center">
              <ButtonRadio current="x" value="B4" label="B4" onClick={onChangeSizeWithDefaultValue}/>
              <ButtonRadio current="x" value="B5" label="B5" onClick={onChangeSizeWithDefaultValue}/>
              <ButtonRadio current="x" value="A4" label="A4" onClick={onChangeSizeWithDefaultValue}/>
              <ButtonRadio current="x" value="A5" label="A5" onClick={onChangeSizeWithDefaultValue}/>
              <ButtonRadio current="x" value="CG 16:9" label="CG 16:9" onClick={onChangeSizeWithDefaultValue}/>
              <ButtonRadio current="x" value="CG 16:10" label="CG 16:10" onClick={onChangeSizeWithDefaultValue}/>
            </div>
          </div>
          <div className="mb-2 row">
            <label htmlFor="input-page-position" className="col-3 col-form-label text-end">position</label>
            <div className="col-9 d-flex align-items-center">
              <ButtonRadio current={storeBook.pagePosition} value="center" label="center" onClick={onChangePagePosition} />
              <ButtonRadio current={storeBook.pagePosition} value="between" label="between" onClick={onChangePagePosition} />
            </div>
          </div>
          <div className="mb-2 row">
            <label className="col-3 col-form-label text-end">show</label>
            <div className="col-9 d-flex align-items-center">
              <ButtonRadio current={storeBook.pageShow} value="two" label="two pages" onClick={onChangePageShow} />
              <ButtonRadio current={storeBook.pageShow} value="one" label="one page" onClick={onChangePageShow} />
            </div>
          </div>
          <div className="mb-2 row">
            <label className="col-3 col-form-label text-end">fit</label>
            <div className="col-9 d-flex align-items-center">
              <ButtonRadio current={storeBook.pageFit} value="stretch" label="stretch" onClick={onChangePageFit} />
              <ButtonRadio current={storeBook.pageFit} value="fit" label="fit" onClick={onChangePageFit} />
              <ButtonRadio current={storeBook.pageFit} value="fill" label="fill" onClick={onChangePageFit} />
            </div>
          </div>
          {
            // <div className="mb-2 row">
            //   <label className="col-3 col-form-label text-end">background</label>
            //   <div className="col-9 d-flex align-items-center">
            //     <ButtonRadio current={storeBook.pageBackgroundColor} value="white" label="white" onClick={onChangePageBackgroundColor} />
            //     <ButtonRadio current={storeBook.pageBackgroundColor} value="black" label="black" onClick={onChangePageBackgroundColor} />
            //   </div>
            // </div>
          }
          <div className="mb-2 row">
            <label className="col-3 col-form-label text-end">direction</label>
            <div className="col-9 d-flex align-items-center">
              <ButtonRadio current={storeBook.pageDirection} value="right" label="right (japanese style)" onClick={onChangePageDirection} />
              <ButtonRadio current={storeBook.pageDirection} value="left" label="left" onClick={onChangePageDirection} />
            </div>
          </div>
          <div className="mb-2 row">
            <label className="col-3 col-form-label text-end">cover</label>
            <div className="col-9 d-flex align-items-center">
              <ButtonRadio current={storeBook.coverPosition} value="first-page" label="first page" onClick={onChangeCoverPosition} />
              <ButtonRadio current={storeBook.coverPosition} value="alone" label="alone" onClick={onChangeCoverPosition} />
            </div>
          </div>
          <div className="mb-2 row">
            <label className="col-3 col-form-label text-end">image tag</label>
            <div className="col-9 d-flex align-items-center">
              <ButtonRadio current={storeBook.imgTag} value="svg" label="<svg />" onClick={onChangeImageTag} />
              <ButtonRadio current={storeBook.imgTag} value="img" label="<img />" onClick={onChangeImageTag} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

const Modal = function() {
  const store = React.useContext(React.createContext(storeMain.ui))

  const modalVisible = store.modalBookVisible || store.modalContentVisible || store.modalPageVisible

  const onClickClose = useCallback(() => {
    store.hideModal()
  }, [store])

  return modalVisible ? (
    <div id="modal" className="modal fade show" style={{display:'block'}} onClick={onClickClose}>
      {
        !store.modalBookVisible ? null : <ModalBook />
      }
      {
        !store.modalContentVisible ? null : <ModalContents />
      }
      {
        !store.modalPageVisible ? null : <ModalPage />
      }
    </div>
  ) : null
}

const ModalBackDrop = observer(function() {
  const store = React.useContext(React.createContext(storeMain.ui))
  const modalVisible = store.modalBookVisible || store.modalContentVisible || store.modalPageVisible

  return modalVisible
    ? <div key="modal-backdrop" className="modal-backdrop fade show"/>
    : null
})

export { ModalBackDrop }
export default observer(Modal)