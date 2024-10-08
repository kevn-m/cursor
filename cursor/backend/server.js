const express = require("express")
const cors = require("cors")
const axios = require("axios")
const fs = require("fs")
const path = require("path")
const os = require("os")

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.post("/download", async (req, res) => {
  console.log("Received download request")
  const { link } = req.body
  console.log(`Received link to download: ${link}`)

  try {
    const response = await axios({
      method: "GET",
      url: link,
      responseType: "stream",
    })

    const fileName = path.basename(link)

    // Set headers for file download
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`)
    res.setHeader("Content-Type", "application/octet-stream")

    // Pipe the file data directly to the response
    response.data.pipe(res)
  } catch (error) {
    console.error("Download error:", error)
    res.status(500).json({ success: false, error: "Download failed" })
  }
})
