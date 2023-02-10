import JSZip from 'jszip'
import { observer } from 'mobx-react'
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import Icon from 'components/icon'
import storeMain from 'store/main'
// import storeBlobs from 'store/blobs'

type SupportType = 'image' | 'zip' | 'epub'

const PageControl = observer(function(props: { pageIndex: number | null }) {
  const onUseImageSizeToPage = useCallback(() => {
    const pageItem = storeMain.book.pages[props.pageIndex as number]
    const image = storeMain.blobs.blobs[pageItem.blobID].originImage
    storeMain.book.updateBookPageProperty('pageSize', [
      image.width,
      image.height
    ])
  }, [props.pageIndex])

  const onChangePageIndex = useCallback(() => {
    const max = storeMain.book.pages.length
    const inputValue = window.prompt(`new page index (1 - ${max}):`)
    let num = parseInt(inputValue || '')
    
    if (isNaN(num) || num < 1) {
      return
    } else if (num > max) {
      num = max
    }

    storeMain.replacePageIndex(props.pageIndex as number, num - 1)
  }, [props.pageIndex])

  const onSetContentq = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    storeMain.contents.setPageIndexToTitle(
      +(e.currentTarget.dataset.index as string),
      props.pageIndex as number
    )
  }, [props.pageIndex])

  const onSplitPage = useCallback(() => {
    storeMain.splitPage(props.pageIndex as number)
  }, [props.pageIndex])

  const onRemovePage = useCallback(() => {
    const res = window.confirm(`remove page index ${props.pageIndex as number + 1}?`)
    res && storeMain.removePage(props.pageIndex as number)
  }, [props.pageIndex])

  if (props.pageIndex === null) {
    return (
      <>
        <div className="nav-item">
          <button type="button" className="btn btn-outline-secondary disabled" disabled><Icon name="ruler"/></button>
        </div>
        <div className="nav-item">
          <button type="button" className="btn btn-outline-secondary disabled" disabled><Icon name="menu"/></button>
        </div>
        <div className="nav-item">
          <button type="button" className="btn btn-outline-secondary disabled" disabled><Icon name="bookmark"/></button>
        </div>
        <div className="nav-item">
          <button type="button" className="btn btn-outline-secondary disabled" disabled><Icon name="scissors"/></button>
        </div>
        <div className="nav-item">
          <button type="button" className="btn btn-outline-secondary disabled" disabled><Icon name="cross"/></button>
        </div>
      </>
    )
  }

  const blankPage = storeMain.book.pages[props.pageIndex].blank

  return (
    <>
      <div className="nav-item">
        <button type="button" className="btn btn-secondary" disabled={blankPage} onClick={onUseImageSizeToPage}>
            <Icon name="ruler"/>
          </button>
      </div>
      <div className="nav-item">
        <button type="button" className="btn btn-secondary" onClick={onChangePageIndex}>
            <Icon name="menu"/>
          </button>
      </div>
      <div className="nav-item dropdown">
        <button type="button" className="btn btn-secondary"><Icon name="bookmark"/></button>
        <ul className="dropdown-menu" style={{top: 0,left:'100%'}}>
          {
            storeMain.contents.list.map((contentItem, index) =>
              <li key={index}>
                <span
                  className={"dropdown-item" + (contentItem.pageIndex === props.pageIndex ? ' active' : '')}
                  data-index={index}
                  onClick={onSetContentq}
                >
                  {contentItem.title}
                </span>
              </li>
            )
          }
        </ul>
      </div>
      <div className="nav-item">
        <button type="button" className="btn btn-secondary" disabled={blankPage} onClick={onSplitPage}>
          <Icon name="scissors"/>
        </button>
      </div>
      <div className="nav-item">
        <button type="button" className="btn btn-secondary" onClick={onRemovePage}>
          <Icon name="cross"/>
        </button>
      </div>
    </>
  )
})

const AcceptMap = {
  image: 'image/jpeg,image/png,image/webp,image/avif',
  zip: 'application/zip',
  epub: 'application/epub+zip',
}

const MultipleAttrMap = {
  image: true,
  zip: false,
  epub: false,
}

const blobToFile = (theBlob: Blob, fileName:string): File => {
  var b: any = theBlob
  //A Blob() is almost a File() - it's just missing the two properties below which we will add
  b.lastModifiedDate = new Date()
  b.name = fileName

  //Cast to a File() type
  return theBlob as File
}

const Header = function() {
  const store = React.useContext(React.createContext(storeMain.ui))
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputType, setInputType] = useState<SupportType>('zip') // 修改这个可以改默认格式

  const onClickToggleBookVisible = useCallback(() => {
    store.toggleBookVisible()
  }, [store])
  const onClickToggleContentVisible = useCallback(() => {
    store.toggleContentVisible()
  }, [store])
  const onClickTogglePageVisible = useCallback(() => {
    store.togglePageVisible()
  }, [store])

  const onClickImport = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    const newType = e.currentTarget.dataset.type as SupportType

    if (newType === inputType) {
      inputRef.current?.click()
    } else {
      setInputType(newType)
    }
  }, [inputType])

  const handleGetFile = useCallback(async () => {
    const input: HTMLInputElement = inputRef.current as HTMLInputElement

    // TODO
    // if (inputType === 'epub') {
    //   console.log(input.files?.[0])
    //   return
    // }

    if (inputType === 'zip' && (input?.files?.[0])) {
      const fileName = input.files[0].name 
      JSZip.loadAsync(input.files[0]).then(zipContent => {
        const zipFiles = Object.keys(zipContent.files).sort().map((filename) => zipContent.files[filename])
        const promises: Promise<File | null>[] = zipFiles.map(zipItem => {
          if (zipItem.dir) {
            return Promise.resolve(null)
          }

          return new Promise(resolve => {
            zipItem.async('uint8array').then(uint8Array => {
              // 检查 MIME type 的方法参考自：
              // https://stackoverflow.com/questions/18299806/how-to-check-file-mime-type-with-javascript-before-upload
              const header = Array.from(new Uint8Array(uint8Array).subarray(0, 4)).map(item => item.toString(16)).join('')
              let mimeType = null
  
              switch (header) {
                case '89504e47':
                  mimeType = 'image/png'
                  break
                case '52494646':
                  mimeType = 'image/webp'
                  break
                case 'ffd8ffe0':
                case 'ffd8ffe1':
                case 'ffd8ffe2':
                case 'ffd8ffe3':
                case 'ffd8ffe8':
                  mimeType = 'image/jpeg'
                  break
                case '00020': // todo: 不确定是不是这个
                  mimeType = 'image/avif'
                  break
                default:
                  break
              }

              if (mimeType) {
                const b = new Blob([uint8Array], { type: mimeType })
                resolve(
                  blobToFile(
                    b,
                    zipItem.name.replace(/^.+\/(.+)$/, '$1')
                  )
                )
              } else {
                resolve(null)
              }
            })
          })
        })

        return Promise.all(promises) as Promise<File[]>
      }).then((files: (File | null)[]) => {
        storeMain.importPageFromImages(files.filter(b => b !== null) as File[])
        if (storeMain.ui.firstImport) {
          storeMain.ui.toggleBookVisible(fileName)
        }
      })
      return
    }

    // inputType === jpg png webp
    storeMain.importPageFromImages(Array.from(input.files as FileList))
  }, [inputType])

  const onClickInsertBlankPage = useCallback(() => {
    const max = storeMain.book.pages.length
    const inputValue = window.prompt(`page index (1 - ${max}):`)
    let num = parseInt(inputValue || '')
    
    if (isNaN(num) || num < 1) {
      return
    } else if (num > max) {
      num = max
    }

    storeMain.insertBlankPage(num - 1)
  }, [])

  const onClickGenerate = useCallback(() => {
    storeMain.generateBook()
  }, [])

  useLayoutEffect(() => {
    setTimeout(() => {
      inputRef.current?.click()
    }, 0)
  }, [inputType])

  return (
    <nav id="nav" className="navbar bg-dark">
      <div className="nav-item dropdown">
        <button type="button" className="btn btn-primary">
          <Icon name="upload"/>
        </button>
        <ul className="dropdown-menu" style={{top: 0,left:'100%'}}>
          <li><span className="dropdown-item" data-type="image" onClick={onClickImport}>image</span></li>
          <li><span className="dropdown-item" data-type="zip" onClick={onClickImport}>zip</span></li>
          {/* <li><span className="dropdown-item" data-type="epub" onClick={onClickImport}>epub</span></li> */}
        </ul>
      </div>
      <div className="nav-item">
        <button type="button" className="btn btn-primary" onClick={onClickToggleBookVisible}><Icon name="book"/></button>
      </div>
      <div className="nav-item">
        <button type="button" className="btn btn-primary" onClick={onClickToggleContentVisible}><Icon name="list"/></button>
      </div>
      <div className="nav-item">
        <button type="button" className="btn btn-primary" onClick={onClickTogglePageVisible}><Icon name="tools"/></button>
      </div>
      <div className="nav-item">
        <button
          type="button"
          className="btn btn-primary"
          disabled={storeMain.book.pages.length === 0}
          onClick={onClickInsertBlankPage}
        >
          <Icon name="notification"/>
        </button>
      </div>
      <div className="nav-item">
        <button
          type="button"
          className="btn btn-primary"
          disabled={storeMain.book.pages.length === 0}
          onClick={onClickGenerate}
        >
          <Icon name="install"/>
        </button>
      </div>
      <PageControl pageIndex={store.selectedPageIndex}/>
      <input
        key={inputType}
        id="input-upload"
        ref={inputRef}
        type="file"
        value=""
        accept={AcceptMap[inputType]}
        multiple={MultipleAttrMap[inputType]}
        onChange={handleGetFile}
        style={{display:"none"}}
      />
    </nav>
  )
}

export default observer(Header)