const { ipcRenderer, ContextBridge, contextBridge } = require('electron')

contextBridge.exposeInMainWorld('api', {
    openDialog() {
        ipcRenderer.send('openFile')
    },
    onFile(callback) {
        ipcRenderer.on('result', (event, message) => {
            callback(message)
        })
    },
    hasFile(callback) {
        ipcRenderer.send('hasFile')
        ipcRenderer.on('hasFileResult', (event, data) => {
            callback(data)
        })
    },
    spawnWindow() {
        ipcRenderer.send('spawnNewWindow')
    }
})