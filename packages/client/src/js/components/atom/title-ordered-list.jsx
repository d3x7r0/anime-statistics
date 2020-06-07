/** @jsx h */
import { h } from 'preact'

export default function TitledOrderedList(props) {
  const {
    title,
    entries = [],
    ...rest
  } = props

  return (
    <div {...rest}>
      <h2>{title}</h2>

      <ol>
        {entries.map(entry => (
          <li key={entry.label}>
            {`${entry.label} - ${entry.value} shows`}
          </li>
        ))}
      </ol>
    </div>
  )
}
