export async function exportPNG(canvasEl) {
  if (!canvasEl) return
  const url = canvasEl.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = 'hallenplaner.png'
  a.click()
}

export async function exportPDF(canvasEl) {
  if (!canvasEl) return
  const { jsPDF } = await import('jspdf')
  const url = canvasEl.toDataURL('image/png')
  const cw = canvasEl.width
  const ch = canvasEl.height
  const ratio = cw / ch

  // A4 landscape
  const pageW = 297
  const pageH = 210
  let imgW = pageW
  let imgH = pageW / ratio
  if (imgH > pageH) {
    imgH = pageH
    imgW = pageH * ratio
  }
  const offsetX = (pageW - imgW) / 2
  const offsetY = (pageH - imgH) / 2

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  doc.addImage(url, 'PNG', offsetX, offsetY, imgW, imgH)
  doc.save('hallenplaner.pdf')
}
