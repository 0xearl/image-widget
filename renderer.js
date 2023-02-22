window.addEventListener('DOMContentLoaded', () => {
    api.hasFile((file) => {
        if(file !== '') {
            const imageDisplay = document.getElementById('imageDisplay')
            const uploadForm = document.getElementById('uploadForm')
            imageDisplay.classList.remove('hidden')
            uploadForm.classList.add('hidden')
            imageDisplay.src = file;
        }
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
