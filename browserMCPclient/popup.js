document.addEventListener('DOMContentLoaded', async () => {
    const { historyAccess = false } = await chrome.storage.local.get(["historyAccess"])
    let checkbox = document.getElementById("history")
    checkbox.checked = historyAccess
    checkbox.addEventListener('change', async ()=>{
        if (checkbox.checked == true) {
            console.log("enabled")
            checkbox.checked = false
            chrome.tabs.create({url:chrome.runtime.getURL("warning.html")});
        } else if (checkbox.checked === false) {
            await chrome.storage.local.set({historyAccess: false})
        }
    })
});