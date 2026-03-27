import { useState } from 'react'

export default function App() {
  const [files, setFiles] = useState([])

  const upload = async (e) => {
    const form = new FormData()
    form.append('file', e.target.files[0])
    await fetch('http://localhost:3001/upload', {
      method: 'POST',
      body: form
    })
  }

  const load = async () => {
    const res = await fetch('http://localhost:3001/tracks')
    setFiles(await res.json())
  }

  return (
    <div>
      <h1>Radio Automation</h1>
      <input type="file" onChange={upload} />
      <button onClick={load}>Load Tracks</button>
      <ul>
        {files.map(f => <li key={f}>{f}</li>)}
      </ul>
    </div>
  )
}
