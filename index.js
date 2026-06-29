import { FastMCP } from "fastmcp";
import { z } from "zod";
import { WebSocketServer } from "ws";

let socket = null;

let arr = new Array();

const wsserver = new WebSocketServer({ 
  port: 9000
});

wsserver.on("connection", (s) => {
    if (socket !== null) {
        socket.close()
    }
    socket = s
    s.send("welcome")
    s.on("message", (message) => {
        arr.push(message.toString())
    })
    s.on("close", (event) => {
        if (socket === s) {
            socket = null;
        }
    })
})

//socket.addEventListener("open", (event) => {
//    socket.send("server");
//});

//socket.addEventListener("message", (event) => {
//    if (event.data !== "'server'") {
//      arr.push(event.data)
//    }
//})

const server = new FastMCP({
  name: "browserMCP",
  version: "1.0.0",
});

server.addTool({
    name: "ping",
    description: "Test the MCP server.",
    parameters: z.object({
        strin: z.string()
    }),
    execute: async (args) => {
        return `Pong: ${args.strin}`
    }
})

server.addTool({
    name: "get_tabs",
    description: "Get current tabs.",
    execute: async () => {
        if (socket !== null) {
            let timeout = 0;
            socket.send(JSON.stringify({"call": "ping", "arg": {}}));
            while(arr.length === 0) {
                await new Promise(resolve => setTimeout(resolve, 10));
                timeout++;
                if(timeout > 2500) {
                    arr.push("failed! (timeout)")
                }
            }
            return String(arr.pop())
        } else {
            return "No client connected."
        }
    }
})

server.addTool({
    name: "group_tabs",
    description: "Group a tab. Make sure to put the ID or IDs in an array, even if it's 1 singular ID. Everything must be in integer.",
    parameters: z.object({
        tabid: z.array(z.number()).describe("Array including a Tab id or Tab ids"),
        groupid: z.number().int().default(67).describe("group id (Optional, if you dont include it it creates a new group.)")
    }),
    execute: async (args) => {
        let timeout = 0;
        if (args.groupid === 67) {
            socket.send(JSON.stringify({"call": "tabg", "arg": {"tab": args.tabid}}));
        } else {
            socket.send(JSON.stringify({"call": "tabg", "arg": {"tab": args.tabid, "group": args.groupid}}));
        }
        // let timeout = 0;
        //socket.send(JSON.stringify({"call": "tabg", "arg": {arrgs.tab}}));
        while(arr.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
            timeout++;
            if(timeout > 2500) {
                arr.push("failed! (timeout)")
            }
        }
        return String(arr.pop())
    }
})

server.addTool({
    name: "group_title",
    description: "Change the title/name of a group",
    parameters: z.object({
        groupid: z.number().int().describe("Group id"),
        title: z.string().describe("New title of group")
    }),
    execute: async (args) => {
        let timeout = 0;
        socket.send(JSON.stringify({"call":"grpt","arg":{"group": args.groupid, "name": args.title}}))
        while(arr.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
            timeout++;
            if(timeout > 2500) {
                arr.push("failed! (timeout)")
            }
        }
        return String(arr.pop())
    }
})

server.addTool({
    name: "open_tabs",
    description: "Open one or more tabs.",
    parameters: z.object({
        tabs: z.array(z.string().url("Must be valid URL")).describe("An array of one or multiple URLs.")
    }),
    execute: async (args) => {
        let timeout = 0;
        socket.send(JSON.stringify({"call": "tabo", "args": args.tabs}))
        while(arr.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
            timeout++;
            if(timeout > 2500) {
                arr.push("failed! (timeout)")
            }
        }
        return String(arr.pop())
    }
})

server.addTool({
    name: "remove_tabs",
    description: "Close/remove one or more tabs.",
    parameters: z.object({
        tabs: z.array(z.number().int()).describe("An array of one or multiple Tab IDs.")
    }),
    execute: async (args) => {
        let timeout = 0;
        socket.send(JSON.stringify({"call": "tabr", "args": args.tabs}))
        while(arr.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
            timeout++;
            if(timeout > 2500) {
                arr.push("failed! (timeout)")
            }
        }
        return String(arr.pop())
    }
})

server.addTool({
    name: "ungroup_tabs",
    description: "Ungroup one or more tabs.",
    parameters: z.object({
        tabs: z.array(z.number().int()).describe("An array of one or multiple Tab IDs.")
    }),
    execute: async (args) => {
        let timeout = 0;
        socket.send(JSON.stringify({"call": "tabug", "args": args.tabs}))
        while(arr.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
            timeout++;
            if(timeout > 2500) {
                arr.push("failed! (timeout)")
            }
        }
        return String(arr.pop())
    }
})


server.addTool({
    name: "tab_url",
    description: "Change URL of a tab.",
    parameters: z.object({
        tabid: z.number().int().describe("Tab ID to change URL of."),
        newurl: z.string().url("Must be a valid URL.").describe("New URL to change to.")
    }),
    execute: async (args) => {
        let timeout = 0;
        socket.send(JSON.stringify({"call": "tabu", "args": {"id": args.tabid, "url": args.newurl}}))
        while(arr.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
            timeout++;
            if(timeout > 2500) {
                arr.push("failed! (timeout)")
            }
        }
        return String(arr.pop())
    }
})

server.addTool({
    name: "collapse_group",
    description: "Collapse a group",
    parameters: z.object({
        groupid: z.number().int().describe("ID of a group"),
        collapsed: z.boolean().describe("Whether to collapse or not")
    }),
    execute: async (args) => {
        let timeout = 0;
        socket.send(JSON.stringify({"call": "grpc", "args": {"id": args.groupid, "collapsed": args.collapsed}}))
        while(arr.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
            timeout++;
            if(timeout > 2500) {
                arr.push("failed! (timeout)")
            }
        }
        return String(arr.pop())
    }
})

server.addTool({
    name: "color_group",
    description: "Color a group.",
    parameters: z.object({
        groupid: z.number().int().describe("A group ID."),
        color: z.enum(["blue", "cyan", "green", "grey", "orange", "pink", "purple", "red", "yellow"]).describe("Color to change group color to."),
    }),
    execute: async (args) => {
        let timeout = 0;
        socket.send(JSON.stringify({"call": "grpco", "args": {"id": args.groupid, "color": args.color}}))
        while(arr.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
            timeout++;
            if(timeout > 2500) {
                arr.push("failed! (timeout)")
            }
        }
        return String(arr.pop())
    }
})

server.addTool({
    name: "sleep_tab",
    description: "Unload a tab.",
    parameters: z.object({
        tabid: z.number().int().describe("A tab ID.")
    }),
    execute: async (args) => {
        let timeout = 0;
        socket.send(JSON.stringify({"call": "tabd", "args": args.tabid}))
        while(arr.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
            timeout++;
            if(timeout > 2500) {
                arr.push("failed! (timeout)")
            }
        }
        return String(arr.pop())
    }
})

server.addTool({
    name: "history_test",
    description: "Test history permissions.",
    execute: async () => {
        let timeout = 0;
        socket.send(JSON.stringify({"call": "hist", "args": {}}))
        while(arr.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
            timeout++;
            if(timeout > 2500) {
                arr.push("failed! (timeout)")
            }
        }
        return String(arr.pop())
    }
})

server.addTool({
    name: "simple_history_get",
    description: "Query browser history in past offsets in hours (example: start=2, end=4). Start and end are relative. Maximum of 24h. Start must be a smaller value than end.",
    parameters: z.object({
        start: z.number().int().max(23).describe("The minimum age of history."),
        end: z.number().int().max(24).describe("The maximum age of history."),
        text: z.string().describe("Search query."),
        maxResults: z.number().int().max(1000).describe("Max results to output. Try not to maximize output for less token usage.")
    }),
    execute: async (args) => {
        if (args.start > args.end || args.start === args.end) {
            socket.send("Invalid usage of start and end (start is over or equal to end)")
        } else {
            let start = Math.floor(new Date()/1000)-args.end*3600
            let end = Math.floor(new Date()/1000)-args.start*3600
            let timeout = 0;
            socket.send(JSON.stringify({"call": "hisg", "args": {"text": args.text, "maxResults": args.maxResults, "start": start, "end": end}}))
            while(arr.length === 0) {
                await new Promise(resolve => setTimeout(resolve, 10));
                timeout++;
                if(timeout > 2500) {
                    arr.push("failed! (timeout)")
                }
            }
            return String(arr.pop())
        }
    }
})

server.start({
  transportType: "stdio",
});
