import { observer } from 'mobx-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useMount } from 'react-use'
import storeMain from 'store/main'
import storeBlobs, { StoreBlobs } from 'store/blobs'
import Icon from './icon'

const THIS_YEAR = (new Date()).getFullYear()

const PageCard = observer(function(props: {
  pageItemIndex: number | null
  blobItem?: StoreBlobs.ImageBlob | null
  pagePosition: 'center' | 'left' | 'right'
  blank: boolean
}) {
  const storeUI = React.useContext(React.createContext(storeMain.ui))
  const storeBook = React.useContext(React.createContext(storeMain.book))
  const storeContent = React.useContext(React.createContext(storeMain.contents))

  const onClickImage = useCallback(() => {
    storeMain.ui.selectPageIndex(props.pageItemIndex)
  }, [props.pageItemIndex])

  if (props.pageItemIndex === null) {
    return (
      <div className="card"><div className="card-image"></div></div>
    )
  }

  let preserveAspectRatio = 'none'

  if (storeBook.pageFit !== 'stretch') {
    preserveAspectRatio = props.pagePosition === 'center'
      ? 'xMidYMid '
      : props.pagePosition === 'left'
        ? 'xMinYMid '
        : 'xMaxYMid '

    if (storeBook.pageFit === 'fit') {
      preserveAspectRatio += 'meet'
    } else { // props.imageFit === 'fill'
      preserveAspectRatio += 'slice'
    }
  }

  const imageFocus = props.pageItemIndex !== null && (storeUI.selectedPageIndex === props.pageItemIndex)

  return (
    <div className="card">
      {
        props.pageItemIndex in storeContent.indexMap
          ? <Icon name="bookmark"></Icon>
          : null
      }
      {
        (props.blobItem || (!props.blobItem && props.blank)) ? (
          <svg
            className="card-image"
            viewBox={'0 0 ' + storeBook.pageSize.join(' ')} onClick={onClickImage}
          >
            <rect x="0" y="0" width="100%" height="100%" fill={storeBook.pageBackgroundColor === 'white' ? '#fff' : '#000'}/>
            {
              props.blobItem ? (
                <image
                  width="100%"
                  height="100%"
                  preserveAspectRatio={preserveAspectRatio}
                  xlinkHref={props.blobItem.thumbnailURL}
                />
              ) : null
            }
            {
              !imageFocus ? null :
                <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="rgba(49,132,253,.5)" strokeWidth="8%"/>
            }
          </svg>
        ) : (
          <div className="card-image">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        )
      }
      {
        props.pageItemIndex === null
          ? null
          : <div className="page-num">{props.pageItemIndex + 1}</div>
      }
    </div>
  )
})

const DoublePageCard = observer(function(props: {
  pages: [number | null, number | null]
}) {
  const storeBook = React.useContext(React.createContext(storeMain.book))

  const leftSidePageIndex = storeBook.pageDirection === 'right' ? props.pages[1] : props.pages[0]
  const rightSidePageIndex = storeBook.pageDirection === 'right' ? props.pages[0] : props.pages[1]
  const leftSidePage = leftSidePageIndex === null ? null : storeBook.pages[leftSidePageIndex]
  const rightSidePage = rightSidePageIndex === null ? null : storeBook.pages[rightSidePageIndex]
  const coverPosition = storeBook.coverPosition === 'alone' ? 1 : 0

  return (
    <div className="card-group">
      <PageCard
        pageItemIndex={leftSidePageIndex === null ? null : (leftSidePageIndex - coverPosition)}
        blobItem={leftSidePage ? storeBlobs.blobs[leftSidePage.blobID] : null}
        pagePosition={storeBook.pagePosition === 'between' ? 'left' : 'center'}
        blank={leftSidePage?.blank || false}
      />
      <PageCard
        pageItemIndex={rightSidePageIndex === null ? null : (rightSidePageIndex - coverPosition)}
        blobItem={rightSidePage ? storeBlobs.blobs[rightSidePage.blobID] : null}
        pagePosition={storeBook.pagePosition === 'between' ? 'right' : 'center'}
        blank={rightSidePage?.blank || false}
      />
    </div>
  )
})

const computedStyle = getComputedStyle(document.documentElement)
const CARD_BOX_WIDTH = +computedStyle.getPropertyValue('--card-box-width').slice(0, -2)
const CARD_BOX_MARGIN = +computedStyle.getPropertyValue('--card-box-margin').slice(0, -2)

const Main = function() {
  const mainRef = useRef<HTMLElement>(null)
  const storeBook = React.useContext(React.createContext(storeMain.book))
  // const storeUI = React.useContext(React.createContext(storeMain.ui))
  const [showPages, setShowPages] = useState<[any, any][][]>([])
  // const [maxCardBoxCountInOneRow, setMaxCardBoxCountInOneRow] = useState(0)

  const pageResizeCallback = useCallback(() => {
    const pageWidth = mainRef.current?.clientWidth
    if (!pageWidth) {
      return
    }

    const boxCountInOneRow = Math.floor(pageWidth / (CARD_BOX_WIDTH + CARD_BOX_MARGIN * 2))
    const rowCount = Math.ceil((1 + storeBook.pages.length) / boxCountInOneRow / 2)

    // if (maxCardBoxCountInOneRow === boxCountInOneRow) {
    //   return
    // }

    if (storeBook.pages.length === 0) {
      // setMaxCardBoxCountInOneRow(boxCountInOneRow)
      setShowPages([])
      return
    }

    let i = 0
    let j = 0
    let x = -1

    const pages: [any, any][][] = []
    const len = storeBook.pages.length

    while(i++ < rowCount) {
      const r: [number | null, number | null][] = []
      while(j++ < boxCountInOneRow) {
        r.push([
          storeBook.coverPosition === 'first-page'
            ? x === -1 ? null : ++x < len ? x : null
            : ++x < len ? x : null,
          ++x < len ? x : null
        ])
      }
      j = 0
      pages.push(storeBook.pageDirection === 'right' ? r.reverse() : r)
    }

    // setMaxCardBoxCountInOneRow(boxCountInOneRow)
    setShowPages(pages)
  }, [storeBook.coverPosition, storeBook.pageDirection, storeBook.pages.length])

  const onClickImport = useCallback(() => {
    document.getElementById('input-upload')?.click()
  }, [])

  useEffect(() => {
    pageResizeCallback()
  }, [storeBook.pages, pageResizeCallback])

  useMount(() => {
    pageResizeCallback()
    // TODO: 需要throttle优化
    window.addEventListener('resize', pageResizeCallback)
  })

  return (
    <main id="main" className="pt-4 pb-4" ref={mainRef}>
      {
        showPages.length === 0 ? (
          process.env.NODE_ENV === 'development'
            ? <div className="btn btn-secondary main-input-upload" onClick={onClickImport}>Import</div>
            : <div className="alert alert-secondary text-center" role="alert">ready 🚀</div>
        ) : (
          showPages.map((row, i) => (
            <div key={i} className="row page-row justify-content-evenly">
              {
                row.map((pages, j) => (<DoublePageCard key={`${i}-${j}-${pages[0]}-${pages[1]}`} pages={pages}/>))
              }
            </div>
          ))
        )
      }
      <div className="row d-flex justify-content-end align-items-center mt-auto author-info">
        <div>{THIS_YEAR} wing-kai@Github</div>
        <iframe
          title="ghbtns"
          className="ghbtns"
          src="https://ghbtns.com/github-btn.html?user=wing-kai&amp;repo=epub-manga-creator&amp;type=star&amp;count=true"
          frameBorder="0"
          scrolling="0"
          width="80px"
          height="20px"
        />
      </div>
    </main>
  )
}

export default observer(Main)