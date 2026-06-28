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

async function historyAccess() {
    const { historyAccess = false } = await chrome.storage.local.get(["historyAccess"])
    return historyAccess
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
                let tabsc = 0;
                const tabs = await chrome.tabs.query({});
                for (let t of tabs) {
                    tabsc++;
                    console.log(t.id)
                    ts+=`Tab title: ${t.title}\nTab ID: ${t.id}\n\n`
                }
                ts += `Tabs open: ${tabsc}\n\n`
                const groups = await chrome.tabGroups.query({});
                for (let g of groups) {
                    console.log(g.id)
                    ts += `Group title: ${g.title}\nGroup ID: ${g.id}\n\n`
                }
                console.log(ts)
                webSocket.send(JSON.stringify({"response": ts}));
            }
            if (toolcall["call"] === "tabg") { // Group one or multiple tabs
                console.log(`Tab to move: ${toolcall["arg"]["tab"]}`)
                if (toolcall["arg"]["group"] !== undefined) {
                    console.log(`Group to move to: ${toolcall["arg"]["group"]}`)
                    await chrome.tabs.group({"tabIds": toolcall["arg"]["tab"], "groupID": toolcall["arg"]["group"]})
                    webSocket.send(`Successful!`)
                } else {
                    console.log("Creating new group..")
                    const gid = await chrome.tabs.group({"tabIds": toolcall["arg"]["tab"]})
                    webSocket.send(`Group ID created: ${gid}`)
                }
            }
            if (toolcall["call"] === "grpt") { // Change the title of a group
                try {
                    console.log(`Group to change title of: ${toolcall["arg"]["group"]}`)
                    let g = await chrome.tabGroups.update(toolcall["arg"]["group"], {title: toolcall["arg"]["name"]})
                    if (g.title === toolcall["arg"]["name"]) {
                        webSocket.send("done")
                    } else {
                        webSocket.send("fail (unknown reason)")
                    }
                } catch (error) {
                    webSocket.send(`chrome fail (${error})`)
                }
            }
            if (toolcall["call"] === "tabo") { // Open one tab or multiple
                try {
                    let tabstr = "";
                    console.log(`Tab urls array: ${toolcall["args"]}`)
                    for (let tab of toolcall["args"]) {
                        let ctab = await chrome.tabs.create({url: tab})
                        if ((ctab.pendingUrl && ctab.pendingUrl.includes(tab)) || (ctab.url && ctab.url.includes(tab))) { // in a valid case, only one should fail
                            tabstr += `Tab created: ${ctab.pendingUrl} / ID: ${ctab.id}\n`
                        } else {
                            tabstr += `Tab with URL ${tab} failed to create.\n`
                        }
                    }
                    webSocket.send(tabstr)
                } catch (error) {
                    webSocket.send(`chrome fail (${error})`)
                }
            }
            if (toolcall["call"] === "tabr") { // Remove one tab or multiple
                try {
                    await chrome.tabs.remove(toolcall["args"])
                    webSocket.send("Successfully closed tabs")
                } catch (error) {
                    webSocket.send(`chrome fail (${error})`)
                }
            }
            if (toolcall["call"] === "tabug") { // Ungroup one tab or multiple
                try {
                    await chrome.tabs.remove(toolcall["args"])
                    webSocket.send("Successfully closed tabs")
                } catch (error) {
                    webSocket.send(`chrome fail (${error})`)
                }
            }
            if (toolcall["call"] === "tabu") { // Update the URL of a tab
                try {
                    let t = await chrome.tabs.update(toolcall["args"]["id"], {url: toolcall["args"]["url"]})
                    if ((t.pendingUrl && t.pendingUrl.includes(toolcall["args"]["url"])) || (t.url && t.url.includes(toolcall["args"]["url"]))) {
                        webSocket.send(`Succesfully updated url of tab id ${t.id} to ${toolcall["args"]["url"]}`)
                    } else {
                        webSocket.send("Failed with unknown reason... :(")
                    }
                } catch (error) {
                    webSocket.send(`chrome fail (${error})`)
                }
            }
            if (toolcall["call"] === "grpc") {
                try {
                    let g = await chrome.tabGroups.update(toolcall["args"]["id"], {collapsed: toolcall["args"]["collapsed"]})
                    if (g.collapsed === toolcall["args"]["collapsed"]) {
                        webSocket.send(`Successfully changed property of collapsed in group ${toolcall["args"]["id"]} to ${g.collapsed}`)
                    } else {
                        webSocket.send("Failed with unknown reason >:(")
                    }
                } catch (error) {
                    webSocket.send(`chrome fail (${error})`)
                }
            }
            if (toolcall["call"] === "grpco") {
                try {
                    let g = await chrome.tabGroups.update(toolcall["args"]["id"], {color: toolcall["args"]["color"]})
                    if (g.color === toolcall["args"]["color"]) {
                        webSocket.send(`Succesfully changed color of group ${toolcall["args"]["id"]} to ${g.color}!`)
                    } else {
                        webSocket.send("Failed with unknown reason >:3")
                    }
                } catch (error) {
                    webSocket.send(`chrome fail (${error})`)
                }
            }
            if (toolcall["call"] === "tabd") {
                try {
                    let t = await chrome.tabs.discard(toolcall["args"]);
                    if (t.status === "unloaded") {
                        webSocket.send(`Successfully unloaded tab ${toolcall["args"]}`)
                    } else {
                        webSocket.send("Failed with unknown reason :O")
                    }
                } catch (error) {
                    webSocket.send(`chrome fail (${error})`)
                }
            }
            if (toolcall["call"] === "hist") { // History test
                try {
                    if (await historyAccess() === true) {
                        webSocket.send("History permissions test: Enabled")
                    } else {
                        webSocket.send("History permissions test: Disabled")
                    }
                } catch (error) {
                    webSocket.send(`chrome fail (${error})`)
                }
            }
        }
    }
}

chrome.runtime.onStartup.addListener(start)

function checkStatus() {
    if(!webSocket || webSocket.readyState === 3) {
        start()
    }
}

setInterval(checkStatus, 1000)
