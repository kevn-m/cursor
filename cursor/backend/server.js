const express = require("express")
const cors = require("cors")
const axios = require("axios")
const fs = require("fs")
const path = require("path")

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

const downloadFolder = path.join(__dirname, "downloads")

// Ensure the download folder exists
if (!fs.existsSync(downloadFolder)) {
  fs.mkdirSync(downloadFolder)
}

app.post("/download", async (req, res) => {
  console.log("Received download request")
  const { links } = req.body
  console.log(`Received ${links.length} links to download`)

  try {
    const downloadPromises = links.map(async (link, index) => {
      console.log(`Starting download for link ${index + 1}: ${link}`)

      const response = await axios({
        method: "GET",
        url: link,
        responseType: "stream",
      })

      const fileName = path.basename(link)
      const filePath = path.join(downloadFolder, fileName)

      const writer = fs.createWriteStream(filePath)
      response.data.pipe(writer)

      return new Promise((resolve, reject) => {
        writer.on("finish", () => {
          console.log(`Finished downloading: ${fileName}`)
          resolve()
        })
        writer.on("error", reject)
      })
    })

    console.log("Starting concurrent downloads...")
    await Promise.all(downloadPromises)
    console.log("All downloads completed successfully")

    res.json({ success: true, downloadPath: downloadFolder })
  } catch (error) {
    console.error("Download error:", error)
    res.status(500).json({ success: false, error: "Download failed" })
  }
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
