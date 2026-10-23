const MAX_EDGE = 256
const QUALITY = 0.85

export function fileToSquareDataUrl(file, { maxEdge = MAX_EDGE, quality = QUALITY } = {}) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'))
      return
    }

    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      try {
        const edge = Math.min(img.naturalWidth, img.naturalHeight)
        const sx = (img.naturalWidth - edge) / 2
        const sy = (img.naturalHeight - edge) / 2
        const out = Math.min(edge, maxEdge)

        const canvas = document.createElement('canvas')
        canvas.width = out
        canvas.height = out
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, out, out)
        ctx.drawImage(img, sx, sy, edge, edge, 0, 0, out, out)

        resolve(canvas.toDataURL('image/jpeg', quality))
      } catch (err) {
        reject(err)
      } finally {
        URL.revokeObjectURL(url)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image'))
    }

    img.src = url
  })
}

export function approxDataUrlKb(dataUrl) {
  if (typeof dataUrl !== 'string') return 0
  const b64 = dataUrl.split(',')[1] || ''
  return Math.round((b64.length * 0.75) / 1024)
}
