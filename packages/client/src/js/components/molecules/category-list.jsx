/** @jsx h */
import { h } from 'preact'

export default function CategoryList(props) {
  const {
    entries = [],
    selected = [],
    onChange,
    onToggleAll,
    label,
    ...rest
  } = props

  return (
    <fieldset {...rest}>
      <legend>{label}:</legend>

      {entries.map(entry => (
        <CategoryEntry
          {...entry}
          onChange={onChange}
          selected={selected.includes(entry.value)}
          key={entry.key || entry.id}
        />
      ))}

      <button
        type="button"
        className="pure-button"
        onClick={onToggleAll}
      >
        Toggle All
      </button>
    </fieldset>
  )
}

function CategoryEntry(props) {
  const {
    label,
    value,
    onChange,
    selected,
  } = props

  const id = `entry_${value}`

  return (
    <label
      htmlFor={id}
      className="pure-checkbox"
    >
      <input type="checkbox"
             checked={selected}
             onChange={(e) => onChange(e.target.value, e.target.checked)}
             value={value}
             id={id} />
      {' '}{label}
    </label>
  )
}
