import { useState } from "react"
import "./App.css"

function App() {
  const [links, setLinks] = useState("")
  const [downloadStatus, setDownloadStatus] = useState("")

  const handleDownload = async (link) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "/download"
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ link }),
      })

      if (!response.ok) {
        throw new Error("Download failed")
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition")
      const filenameMatch =
        contentDisposition && contentDisposition.match(/filename="?(.+)"?/)
      const filename = filenameMatch ? filenameMatch[1] : "download"

      // Create a blob from the response
      const blob = await response.blob()

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob)

      // Create a temporary anchor element and trigger the download
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setDownloadStatus(`Downloaded: ${filename}`)
    } catch (error) {
      console.error("Error:", error)
      setDownloadStatus(`Download failed for: ${link}`)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setDownloadStatus("Downloading...")

    const linksArray = links.split("\n").filter((link) => link.trim() !== "")
    console.log(`Sending ${linksArray.length} links to server for download`)

    for (const link of linksArray) {
      try {
        console.log(`Sending request to server for: ${link}`)
        await handleDownload(link)
      } catch (error) {
        console.error("Error:", error)
        setDownloadStatus(`Download failed for: ${link}`)
      }
    }

    setDownloadStatus("All downloads completed")
  }

  return (
    <div className="App">
      <h1>Multi-Link Downloader</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          placeholder="Enter links (one per line)"
          rows="10"
          cols="50"
        />
        <br />
        <button type="submit">Download All</button>
      </form>
      {downloadStatus && <p>{downloadStatus}</p>}
    </div>
  )
}

export default App
