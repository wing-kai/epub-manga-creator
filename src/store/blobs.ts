import { action, makeAutoObservable, observable, runInAction } from "mobx"

export declare namespace StoreBlobs {
  export interface ImageBlob {
    blob: Blob
    blobURL: string
    thumbnailURL: string
    originImage: HTMLImageElement
  }
}

const getImageWithBlobURL = (blobURL: string): Promise<HTMLImageElement> => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image()
  image.onerror = (e) => reject(e)
  image.onload = (e) => {
    resolve(image)
  }
  image.src = blobURL
})

const formatBlobItem = async (blob: Blob) => {
  const blobURL = URL.createObjectURL(blob)

  const originImage = await getImageWithBlobURL(blobURL)

  const canvas = document.createElement("canvas")
  if (originImage.width < originImage.height) {
    canvas.width = originImage.width / originImage.height * 200
    canvas.height = 200
  } else if (originImage.width > originImage.height) {
    canvas.width = 200
    canvas.height = originImage.height / originImage.width * 200
  } else {
    canvas.width = 200
    canvas.height = 200
  }

  const context = canvas.getContext('2d') as CanvasRenderingContext2D
  context.imageSmoothingQuality = 'high'
  context.drawImage(originImage, 0, 0, canvas.width, canvas.height)

  const thumbnailBlob = await new Promise<Blob>(
    (resolve, reject) => canvas.toBlob(
      blob => blob ? resolve(blob) : reject()
    )
  )

  const item: StoreBlobs.ImageBlob = {
    blob,
    blobURL,
    thumbnailURL: URL.createObjectURL(thumbnailBlob),
    originImage
  }

  return item
}

class Store {
  @observable blobs: ({[id: string]: StoreBlobs.ImageBlob}) = {}

  constructor() {
    makeAutoObservable(this)
  }

  @action
  async push(blobs: Blob[], uuids: string[]) {
    let formatBlobs: StoreBlobs.ImageBlob[] = []

    try {
      formatBlobs = await Promise.all(blobs.map(formatBlobItem))
    } catch (err) {
      console.error(err)
      alert('错误\nError')
      return
    }

    runInAction(() => {
      const blobs: ({[id: string]: StoreBlobs.ImageBlob}) = {}

      uuids.forEach((uuid, index) => {
        blobs[uuid] = formatBlobs[index]
      })

      // Object.assign(this.blobs, blobs)
      this.blobs = {
        ...this.blobs,
        ...blobs
      }
    })
  }
}

export { Store }
export default new Store()