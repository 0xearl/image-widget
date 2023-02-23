const { app, BrowserWindow, dialog, ipcMain, globalShortcut } = require('electron')
const path = require('path')
const fs = require('fs')
const sizeOf = require('image-size')

var windows = new Set()

const createWindow = () => {
   let win = new BrowserWindow({
        width: 800,
        height: 600,
        maximizable: false,
        useContentSize: true,
        frame: false,
        transparent: true,
        focusable: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            devTools: true,
        }
    })

    win.loadFile('index.html')
    // win.openDevTools()

    win.on('close', () => {
        windows.delete(win)
        win = null
    })

    windows.add(win)

    return win
}

const openFile = () => {
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
            BrowserWindow.getFocusedWindow().webContents.send('result', result.filePaths[0])
            sizeOf(result.filePaths[0], (err, dimensions) => {
                BrowserWindow.getFocusedWindow().setSize(dimensions.width, dimensions.height)
            })
            
        }
    })
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    /**
     * Register our shortcuts
     */
    globalShortcut.register('CommandOrControl+O', () => {
        openFile()
    })

    globalShortcut.register('CommandOrControl+N', () => {
        createWindow()
    })

    globalShortcut.register('CommandOrControl+L', () => {
        if(BrowserWindow.getFocusedWindow().isMovable()) {
            BrowserWindow.getFocusedWindow().setMovable(false)
        } else {
            BrowserWindow.getFocusedWindow().setMovable(true) 
        }
    })

    globalShortcut.register('CommandOrControl+T', () => {
        if(BrowserWindow.getFocusedWindow().isAlwaysOnTop()) {
            BrowserWindow.getFocusedWindow().setAlwaysOnTop(false)
        } else {
            BrowserWindow.getFocusedWindow().setAlwaysOnTop(true)
        }
    })

})

app.on('will-quit', () => {
    globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('openFile', () => {
    openFile()
})

ipcMain.on('hasFile', () => {
    fs.readFile(path.join(__dirname, 'content.json'), (err, data) => {
        if(err) return
        let json = JSON.parse(data)

        if(json.image !== '') BrowserWindow.getFocusedWindow().webContents.send('hasFileResult', json.image)
    })
})

ipcMain.on('spawnNewWindow', () => {
    createWindow()
})