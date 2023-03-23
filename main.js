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
        icon: path.join(__dirname, 'assets/icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            devTools: false,
        }
    })

    win.loadFile('index.html')
    win.setSkipTaskbar(true);

    win.on('close', () => {
        windows.delete(win)
        win = null
    })

    tray = new Tray(path.join(__dirname, 'assets/icon.ico'))

    const contextmenu = Menu.buildFromTemplate([
        {
            browserWindow: win,
            label: 'Close', 
            type: 'normal',
            click: (event) => {
                let trayWindow = event.browserWindow
                trayWindow.close()
                tray.destroy()
            }
        },
        {
            browserWindow: win,
            label: 'Lock/Unlock',
            click: (event) => {
                let trayWindow = event.browserWindow
                lock(trayWindow)
            }
        },
        {
            browserWindow: win,
            label: 'Enable/Disable Always on top',
            click: (event) => {
                let trayWindow = event.browserWindow
                alwaysOnTop(trayWindow)
            }
        }
    ])

    tray.setToolTip('Image Widget')
    tray.setContextMenu(contextmenu)

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

const lock = (win) => {
    if(win) {
        if(win.isMovable()) {
            dialog.showMessageBox(win, {message: 'Image position locked', type: 'info'})
            win.setMovable(false)
        } else {
            dialog.showMessageBox(win, {message: 'Image position unlocked', type: 'info'})
            win.setMovable(true)
        }
    } else {
        if(BrowserWindow.getFocusedWindow().isMovable()) {
            dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {message: 'Image position locked', type: 'info'})
            BrowserWindow.getFocusedWindow().setMovable(false)
        } else {
            dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {message: 'Image position unlocked', type: 'info'})
            BrowserWindow.getFocusedWindow().setMovable(true)
        }
    }
}

const alwaysOnTop = (win) => {
    if(win) {
        if(win.isAlwaysOnTop()) {
            dialog.showMessageBox(win, {message: 'Always on top disabled', type: 'info'})
            win.setAlwaysOnTop(false)
        } else {
            dialog.showMessageBox(win, {message: 'Always on top enabled', type: 'info'})
            win.setAlwaysOnTop(true)
        }
    } else {
        if(BrowserWindow.getFocusedWindow().isAlwaysOnTop()) {
            dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {message: 'Always on top disabled', type: 'info'})
            BrowserWindow.getFocusedWindow().setAlwaysOnTop(false)
        } else {
            dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {message: 'Always on top enabled', type: 'info'})
            BrowserWindow.getFocusedWindow().setAlwaysOnTop(true)
        }
    }
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

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