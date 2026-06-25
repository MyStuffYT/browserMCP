import { FastMCP } from "fastmcp";
import { stringbool, z } from "zod";

const socket = new WebSocket('ws://localhost:9000');

let arr = new Array();

socket.addEventListener("open", (event) => {
    socket.send("server");
});

socket.addEventListener("message", (event) => {
    if (event.data !== "'server'") {
      arr.push(event.data)
    }
})

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
    name: "tabs",
    description: "Get current tabs.",
    execute: async (args) => {
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
    }
})

server.addTool({
    name: "tabg",
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
        // socket.send(JSON.stringify({"call": "tabg", "arg": {arrgs.tab}}));
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

server.start({
  transportType: "stdio",
});