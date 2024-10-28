import { useState } from "react"

export function Main({ name = "Extension" }) {
  const [data, setData] = useState("")

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}>
      <h1 className="bg-red-600">
        Welcome to youur <a href="https://sites.google.co/images?q=abcd/">Plasmo</a> {name}!
      </h1>
      <input onChange={(e) => setData(e.target.value)} value={data} />

      <a href="https://docs.plasmo.com">READ THE DOCS!</a>
    </div>
  )
}
