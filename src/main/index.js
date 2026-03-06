import { app, BrowserWindow, desktopCapturer, session } from "electron"
import { join } from "path"

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"))
  }
}

app.whenReady().then(() => {

  session.defaultSession.setDisplayMediaRequestHandler(
    async (request, callback) => {

      const sources = await desktopCapturer.getSources({
        types: ["screen"]
      })

      callback({
        video: sources[0],
        audio: "loopback"
      })

    },
    { useSystemPicker: false }
  )

  createWindow()
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})