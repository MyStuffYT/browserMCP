let webSocket = null;
let closed = false;

const keepAlive = (i => state => {
  if (state && !i) {
    if (performance.now() > 20e3) chrome.runtime.getPlatformInfo();
    i = setInterval(chrome.runtime.getPlatformInfo, 20e3);
  } else if (!state && i) {
    clearInterval(i);
    i = 0;
  }
})();

keepAlive(true);

function connect() {
    if (webSocket !== null) {
        if (webSocket.readyState === 2) {
            setInterval(connect, 500)
        } else if (webSocket.readyState === 3) {
            webSocket = new WebSocket("ws://127.0.0.1:9000/")
            //webSocket.onopen = (event) => {
            //    webSocket.send("client");
            //}
        }
    } else {
        webSocket = new WebSocket("ws://127.0.0.1:9000/")
        //webSocket.onopen = (event) => {
        //    webSocket.send("client");
        //}
    }
}

function close() {
    if (webSocket.readyState < 2) {
        webSocket.close();
    }
    keepAlive(false);
}

chrome.runtime.onInstalled.addListener(function (object) {
    if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        let internalUrl = chrome.runtime.getURL("success.html");

        webSocket = new WebSocket('ws://127.0.0.1:9000/');
        //webSocket.onopen = (event) => {
        //    webSocket.send("client");
            //console.log(webSocket.readyState)
        //}

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

function start() {
    connect();
    webSocket.onopen = (event) => {
        chrome.tabs.create({url:chrome.runtime.getURL("normal.html")});
        closed = false;
    }
    webSocket.onclose = (event) => {
        //connect();
        closed = true;
    }
    webSocket.onmessage = async (event) => {
        console.log(event.data)
        if (event.data !== "welcome") {
            console.log(event.data)
            toolcall = JSON.parse(event.data)
            console.log(toolcall)
            if (toolcall["call"] === "ping") {
                let ts = "Available tabs:\n";
                const tabs = await chrome.tabs.query({});
                for (let t of tabs) {
                    console.log(t.id)
                    ts+=`Tab title: ${t.title}\nTab ID: ${t.id}\n\n`
                }
                const groups = await chrome.tabGroups.query({});
                for (let g of groups) {
                    console.log(g.id)
                    ts += `Group title: ${g.title}\nGroup ID: ${g.id}\n\n`
                }
                console.log(ts)
                webSocket.send(JSON.stringify({"response": ts}));
            }
            if (toolcall["call"] === "tabg") {
                console.log(`Tab to move: ${toolcall["arg"]["tab"]}`)
                if (toolcall["arg"]["group"] !== undefined) {
                    console.log(`Group to move to: ${toolcall["arg"]["group"]}`)
                    await chrome.tabs.group({"tabIds": toolcall["arg"]["tab"], "groupID": toolcall["arg"]["group"]})
                    webSocket.send(`Successful! (hopefully..)`)
                } else {
                    console.log("Creating1 new group..")
                    const gid = await chrome.tabs.group({"tabIds": toolcall["arg"]["tab"]})
                    webSocket.send(`Group ID created: ${gid}`)
                }
            }
            if (toolcall["call"] === "tabt") {
                try {
                    console.log(`Tab to change title of: ${toolcall["arg"]["group"]}`)
                    let g = await chrome.tabGroups.update(toolcall["arg"]["group"], {title: toolcall["arg"]["name"]})
                    if (g.title === toolcall["arg"]["name"]) {
                        webSocket.send("done")
                    } else {
                        webSocket.send("fail (unknown reason)")
                    }
                } catch (error) {
                    webSocket.send(`fail (${error})`)
                }
            }
        }
    }
};

chrome.runtime.onStartup.addListener(start)

function checkStatus() {
    if(!webSocket || webSocket.readyState === 3) {
        start()
    }
}

setInterval(checkStatus, 1000)
