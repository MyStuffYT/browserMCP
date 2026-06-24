import asyncio
from websockets.asyncio.server import serve
import json

av = ["ping", "tabs", "tabg"]
ctcall = ""
ctarg = {}
ctresp = ""
cav = asyncio.Event()
sr = asyncio.Event()

async def clientc(websocket):
    global ctarg, ctcall, ctresp
    definition = await websocket.recv()
    await websocket.send(repr(definition))
    if definition == "server":
        while True:
            toolcall = await websocket.recv()
            await websocket.send("continue")
            match toolcall:
                case "ping":
                    ctcall = "ping"
                    cav.set()
                    await sr.wait()
                    r = await websocket.send(ctresp)
                    sr.clear()
                case "tabg":
                    ctcall = "tabg"
                    tab = await websocket.recv()
                    await websocket.send("continue")
                    group = await websocket.recv()
                    ctarg = {"tab": tab, "group": group}
                    await websocket.send(f"done: call {ctcall} arg group tabid {ctarg["tab"]} to groupid {ctarg["group"]}")
                    cav.set()
    if definition == "client":
        await websocket.send("welcome")
        while True:
            await cav.wait()
            await websocket.send(json.dumps({"call": ctcall, "arg": ctarg}))
            r = await websocket.recv()
            ctresp = r
            sr.set()
            cav.clear()
                    
async def main():
    async with serve(clientc, "127.0.0.1", 9000) as server:
        await server.serve_forever()

if __name__ == "__main__":
    asyncio.run(main())