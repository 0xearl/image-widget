const { app, BrowserWindow, dialog, ipcMain, globalShortcut, Tray, Menu } = require('electron')
const path = require('path')
const fs = require('fs')
const sizeOf = require('image-size')

var windows = new Set()
let tray;

const createWindow = () => {
   let win = new BrowserWindow({
        width: 800,
        height: 600,
        maximizable: false,
        useContentSize: true,
        frame: false,
        transparent: true,
        focusable: true,
        icon: './icon.png',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            devTools: true,
        }
    })

    win.loadFile('index.html')
    win.setSkipTaskbar(true);
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

const lock = () => {
    if(BrowserWindow.getFocusedWindow().isMovable()) {
        dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {message: 'Image position locked', type: 'info'})
        BrowserWindow.getFocusedWindow().setMovable(false)
    } else {
        dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {message: 'Image position unlocked', type: 'info'})
        BrowserWindow.getFocusedWindow().setMovable(true)
    }
}

const alwaysOnTop = () => {
    if(BrowserWindow.getFocusedWindow().isAlwaysOnTop()) {
        dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {message: 'Always on top disabled', type: 'info'})
        BrowserWindow.getFocusedWindow().setAlwaysOnTop(false)
    } else {
        dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {message: 'Always on top enabled', type: 'info'})
        BrowserWindow.getFocusedWindow().setAlwaysOnTop(true)
    }
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    tray = new Tray('./icon.png')

    const contextmenu = Menu.buildFromTemplate([
        {
            label: 'Close', 
            type: 'normal',
            click: () => {
                app.quit();
            }
        },
    ])

    tray.setToolTip('Image Widget')
    tray.setContextMenu(contextmenu)
    

    /**
     * Register our shortcuts
     */
    globalShortcut.register('Alt+CommandOrControl+O', () => {
        openFile()
    })

    globalShortcut.register('Alt+CommandOrControl+N', () => {
        createWindow()
    })

    globalShortcut.register('Alt+CommandOrControl+L', () => {
        lock()
    })

    globalShortcut.register('Alt+CommandOrControl+T', () => {
        alwaysOnTop()
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