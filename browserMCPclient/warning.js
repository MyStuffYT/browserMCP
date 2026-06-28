document.addEventListener('DOMContentLoaded', () => {
    let button = document.getElementById("confirmc")
    button.addEventListener('click', async () => {
        await chrome.storage.local.set({historyAccess: true})
        window.close()
    })
});