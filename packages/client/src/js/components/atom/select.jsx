import { h } from 'preact'
import classNames from 'clsx'

export default function Select(props) {
  const {
    name,
    className,
    onChange,
    label,
    value,
    entries = [],
    ...rest
  } = props

  return (
    <div
      className={classNames(className, 'form-select')}
      {...rest}
    >
      <label htmlFor={name}>{label}:</label>

      {/* eslint-disable-next-line jsx-a11y/no-onchange */}
      <select
        id={name}
        name={name}
        onChange={onChange}
        value={value}
      >
        {entries.map(entry => (
          <option key={entry.value} value={entry.value}>
            {entry.label}
          </option>
        ))}
      </select>
    </div>
  )
}
