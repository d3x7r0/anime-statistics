// Charts
import Chart from 'chart.js'
import { ACTIVE_YEARS } from '../config'

export function printChart (id, title, width = 800, height = 600) {
  const $target = document.getElementById(id)

  const $title = document.createElement('h2')
  $title.textContent = title

  const $canvas = document.createElement('canvas')
  $canvas.setAttribute('class', 'js-output')
  $canvas.setAttribute('width', `${width}`)
  $canvas.setAttribute('height', `${height}`)

  let $download
  if ($target.className && $target.className.indexOf('js-downloadable') !== -1) {
    $download = document.createElement('a')
    $download.setAttribute('href', '#download')
    $download.setAttribute('class', 'pure-button pure-button-primary js-download pure-button-disabled')
    $download.setAttribute('download', title + '.png')
    $download.textContent = 'Save to PNG'
  }

  $target.appendChild($title)
  $target.appendChild($canvas)

  if ($download) {
    $target.appendChild($download)
  }

  return $target
}

export function drawLineChart ($target, ds, yAxis) {
  const $output = $target.querySelectorAll('.js-output')

  if (!$output.length) {
    console.warn('Missing canvas', $target)
    return
  }

  return new Chart($output[0], {
    type: 'line',
    data: {
      labels: ACTIVE_YEARS,
      datasets: ds.slice(0),
    },
    options: {
      tooltips: {
        mode: 'label',
      },
      hover: {
        mode: 'label',
      },
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'year',
          },
        }],
        yAxes: [yAxis],
      },
    },
  })
}
