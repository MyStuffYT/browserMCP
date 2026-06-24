let webSocket = null;

function connect() {
    if (webSocket !== null) {
        if (webSocket.readyState === 2) {
            setInterval(connect, 500)
        } else if (webSocket.readyState === 3) {
            webSocket = new WebSocket("ws://127.0.0.1:9000/")
            webSocket.onopen = (event) => {
                webSocket.send("client");
            }
        }
    } else {
        webSocket = new WebSocket("ws://127.0.0.1:9000/")
        webSocket.onopen = (event) => {
            webSocket.send("client");
        }
    }
}

function close() {
    if (webSocket.readyState < 2) {
        webSocket.close();
    }
}

chrome.runtime.onInstalled.addListener(function (object) {

    if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        let internalUrl = chrome.runtime.getURL("success.html");

        webSocket = new WebSocket('ws://127.0.0.1:9000/');
        webSocket.onopen = (event) => {
            webSocket.send("client");
            //console.log(webSocket.readyState)
        }

        webSocket.onmessage = (event) => {
            if (event.data === "welcome") {
                chrome.tabs.create({ url: internalUrl });
                webSocket.close();
                //console.log(webSocket.readyState)
                //setTimeout(function() {console.log(webSocket.readyState)}, 1000)
            }
        }

    }
});

chrome.runtime.onStartup.addListener(function() {
    chrome.tabs.create({url:chrome.runtime.getURL("normal.html")});
    connect();

    webSocket.onmessage = (event) => {
        console.log(event.data)
        if (event.data !== "'client'" && event.data !== "welcome") {
            toolcall = JSON.parse(event.data)
            if (toolcall["call"] === "ping") {
                webSocket.send("pong (from browserMCP client!)")
            }
        }
    }
});