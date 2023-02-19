window.addEventListener('DOMContentLoaded', () => {
    api.hasFile((file) => {
        const imageDisplay = document.getElementById('imageDisplay')
        const uploadForm = document.getElementById('uploadForm')
        imageDisplay.classList.remove('hidden')
        uploadForm.classList.add('hidden')
        imageDisplay.src = file;
    })

    const fileUpload = document.getElementById('imageSelect')
    fileUpload.addEventListener('click', (event) => {
        api.openDialog();
    })

    api.onFile((file) => {
        const imageDisplay = document.getElementById('imageDisplay')
        const uploadForm = document.getElementById('uploadForm')
        imageDisplay.classList.remove('hidden')
        uploadForm.classList.add('hidden')
        imageDisplay.src = file;
    })
})

window.addEventListener('keypress', (event) => {
    if(event.key == 'c') {
        api.openDialog()
    }

    if(event.key == 'n') {
        api.spawnWindow()
    }
})