const { app, BrowserWindow, dialog, ipcMain, screen } = require('electron')
const path = require('path')
const fs = require('fs')

const createWindow = () => {
    let display = screen.getPrimaryDisplay()
    let size = display.workAreaSize
    let width = display.bounds.width

    const win = new BrowserWindow({
        width: 800,
        height: 600,
        maximizable: false,
        useContentSize: true,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            devTools: true,
        }
    })

    // win.webContents.openDevTools()

    win.loadFile('index.html')

    ipcMain.on('openFile', () => {
        dialog.showOpenDialog({properties: ['openFile']}).then(result => {
            if(!result.canceled) {
                fs.readFile(path.join(__dirname, 'content.json'), (err, data) => {
                    if(err) return
                    let json = JSON.parse(data)
        
                    json.image = result.filePaths[0]

                    fs.writeFile(path.join(__dirname, 'content.json'), JSON.stringify(json), (err) => {
                        if (err) throw err;
                    })
                })
                win.webContents.send('result', result.filePaths[0])
            }
        })
    })

    ipcMain.on('hasFile', () => {
        fs.readFile(path.join(__dirname, 'content.json'), (err, data) => {
            if(err) return
            let json = JSON.parse(data)

            if(json.image !== '') win.webContents.send('hasFileResult', json.image)
        })
    })
}
app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})