// DOM
export function setupDownloads () {
  const $entries = document.querySelectorAll('.js-downloadable')

  Array.prototype.slice.call($entries)
    .forEach($el => {
      $el.addEventListener('click', onDownloadClick)
      const $buttons = $el.querySelectorAll('.js-download')

      Array.prototype.slice.call($buttons)
        .forEach($b => $b.classList.remove('pure-button-disabled'))
    })
}

function onDownloadClick (e) {
  if (e.target && e.target.matches('.js-download')) {
    const $canvas = this.querySelectorAll('.js-output')[0]

    if (!$canvas) {
      e.preventDefault()
      return false
    }

    e.target.href = $canvas.toDataURL('image/png')
  }
}
