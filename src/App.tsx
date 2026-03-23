import { useState } from "react"
import SearchableDropdown from "./core/components/shadcn/Dropdown"

export function App() {
  const [selected, setSelected] = useState([])
  return (
    <div className="grid h-dvh w-full place-items-center">
      <div className="w-64">
        {/* <Buttonshowcase /> */}
        <SearchableDropdown
          items={[
            {
              value: "String",
              label: "string",
            },
            {
              value: "String2",
              label: "string2",
            },
            {
              value: "String3",
              label: "string3",
            },
          ]}
          onChange={(val) => setSelected(val)}
          value={selected}
          getItemLabel={(item) => item?.label}
          getItemValue={(item) => item?.value}
          renderItem={(item) => (
            <div className="w-full rounded-md bg-red-500 px-3 py-2">
              <p>{item?.label}</p>
            </div>
          )}
          multiple
          maxCount={1}
        />
      </div>
    </div>
  )
}

export default App
