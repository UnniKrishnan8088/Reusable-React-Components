import { type SelectHTMLAttributes } from "react"

type Option = {
  label: string
  value: string
}

export interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[]
  placeholder?: string
}

export default function Dropdown({
  options,
  placeholder = "Select an option",
  value,
  onChange,
  ...rest
}: Props) {
  return (
    <select value={value} onChange={onChange} {...rest}>
      {placeholder && (
        <option value="" disabled>
          <span className="text-gray-400">{placeholder}</span>
        </option>
      )}
      {options?.map((opt) => (
        <option value={opt?.value} key={opt?.value}>
          {opt?.label}
        </option>
      ))}
    </select>
  )
}
