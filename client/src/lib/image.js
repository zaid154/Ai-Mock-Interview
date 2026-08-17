// Downscale a picked image to a small square data URL before it is sent.
//
// The avatar is stored as a plain String on the User document, so whatever we
// upload is what lives in Mongo AND what ships back on every /auth/me call. A
// 3 MB photo becomes a ~4 MB base64 string — that is what used to trip the
// request size limit. Re-encoding to a 256px square JPEG puts it around 20-40 KB,
// and because it is a single field, writing it replaces the previous one outright:
// there is no orphaned copy to clean up.

const MAX_EDGE = 256
const QUALITY = 0.85

export function fileToSquareDataUrl(file, { maxEdge = MAX_EDGE, quality = QUALITY } = {}) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('That file is not an image'))
      return
    }

    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      try {
        // Centre-crop to a square first so the circular frame never distorts.
        const edge = Math.min(img.naturalWidth, img.naturalHeight)
        const sx = (img.naturalWidth - edge) / 2
        const sy = (img.naturalHeight - edge) / 2
        const out = Math.min(edge, maxEdge)

        const canvas = document.createElement('canvas')
        canvas.width = out
        canvas.height = out
        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingQuality = 'high'
        // Flatten onto white: JPEG has no alpha, and a transparent PNG would
        // otherwise come out with a black background.
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
      reject(new Error('Could not read that image'))
    }

    img.src = url
  })
}

export function approxDataUrlKb(dataUrl) {
  if (typeof dataUrl !== 'string') return 0
  const b64 = dataUrl.split(',')[1] || ''
  return Math.round((b64.length * 0.75) / 1024)
}
