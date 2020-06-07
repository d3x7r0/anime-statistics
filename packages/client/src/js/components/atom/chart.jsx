/** @jsx h */
import { h } from 'preact'
import { useCallback, useLayoutEffect, useRef } from 'preact/hooks'
import Chart from 'chart.js'

function ChartWrapper(props) {
  const {
    title,
    downloadable,
    options,
    width = 640,
    height = 480,
    ...rest
  } = props

  const ref = useRef()

  useLayoutEffect(() => {
    if (!options) {
      return
    }

    const c = new Chart(ref.current, options)

    return () => {
      c.destroy()
    }
  }, [options])

  const onDownloadClick = useCallback((e) => {
    if (!ref.current) {
      e.preventDefault()
      return
    }

    e.target.href = ref.current.toDataURL('image/png')
  }, [])

  return (
    <div {...rest}>
      <h2>{title}</h2>

      <canvas
        width={width}
        height={height}
        ref={ref}
      />

      {downloadable ? (
        <a
          href="#download"
          className="pure-button pure-button-primary"
          download={`${title}.png`}
          onClick={onDownloadClick}
        >
          Save to PNG
        </a>
      ) : null}
    </div>
  )
}

export default ChartWrapper
