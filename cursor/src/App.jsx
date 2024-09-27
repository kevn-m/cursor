import { useState } from "react"
import "./App.css"

function App() {
  const [links, setLinks] = useState("")
  const [downloadStatus, setDownloadStatus] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setDownloadStatus("Downloading...")

    const linksArray = links.split("\n").filter((link) => link.trim() !== "")
    console.log(`Sending ${linksArray.length} links to server for download`)

    try {
      console.log("Sending request to server...")
      const response = await fetch("http://localhost:3000/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ links: linksArray }),
      })

      if (!response.ok) {
        throw new Error("Download failed")
      }

      console.log("Received response from server")
      const result = await response.json()
      if (result.success) {
        console.log(
          `Download successful. Files saved to: ${result.downloadPath}`
        )
        setDownloadStatus(
          `Download complete! Files saved to: ${result.downloadPath}`
        )
      } else {
        throw new Error(result.error || "Download failed")
      }
    } catch (error) {
      console.error("Error:", error)
      setDownloadStatus("Download failed. Please try again.")
    }
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
