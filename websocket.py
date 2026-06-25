import asyncio
from websockets.asyncio.server import serve
import json

av = ["ping", "tabs", "tabg"]
ctcall = ""
ctarg = {}
ctresp = ""

qid = 0
queue = asyncio.Queue()
rqueue = asyncio.Queue()

cav = asyncio.Event()
sr = asyncio.Event()

async def clear(q: asyncio.Queue): # more clearner way to clear a queue
    while not q.empty():
        q.get_nowait()

async def clientc(websocket):
    global ctarg, ctcall, ctresp, queue, rqueue
    definition = await websocket.recv()
    await websocket.send(repr(definition))
    if definition == "server":
        while True: # client should build the entire json.
            # new recode
            # example call: {"call": "ping", "arg": {}}
            # example arg call: {"call": "tabg", "arg": {"tab": 67, "group": 69}}
            toolcall = await websocket.recv()

            try:
                if queue._getters:
                    dtoolcall = json.loads(toolcall)
                    dtoolcall["call"]
                    dtoolcall["arg"]
                    await queue.put(toolcall) # put a string directly in toolcall cuz it makes life easier
                    r = await rqueue.get()
                    await websocket.send(r)
                elif not queue._getters:
                    await websocket.send('{"status": False, "response": "no client found :("}')
            except KeyError:
                await websocket.send(json.dumps({"status": False, "response": "invalid format for toolcall"}))
            except json.JSONDecodeError:
                await websocket.send(json.dumps({"status": False, "response": "could not decode json :("}))
            except Exception as err:
                await websocket.send(json.dumps({"status": False, "response": f"idk: {str(err)}"}))
            #toolcall = await websocket.recv()
            #await websocket.send("continue")
            #match toolcall:
                #case "ping":
                    #ctcall = "ping"
                    #dfull = {"call": toolcall, "arg": {}}
                    #await queue.put(dfull)
                    #r = await rqueue.get()
                    #await websocket.send(r)
                #case "tabg":
                    #ctcall = "tabg"
                    #jdata = await websocket.recv()
                    #jdata = json.loads(jdata) # example: {"tab": 67, "group": "69"}
                    #dfull = {"call": toolcall, "arg": jdata}
                    #await queue.put(dfull)
                    #tab = await websocket.recv()
                    #await websocket.send("continue")
                    #group = await websocket.recv()
                    #ctarg = {"tab": tab, "group": group}
                    #await websocket.send(json.dumps(dfull))

                    #res = await rqueue.get()
                    #await websocket.send(res)


    if definition == "client": # There should be a better way i think
        await websocket.send("welcome")
        while True:
            try:
                tcall = await queue.get()
                await websocket.send(tcall)
                try:
                    r = await asyncio.wait_for(websocket.recv(), timeout=10)
                except asyncio.TimeoutError:
                    r = "response timeout"
                await rqueue.put(r)
            except websocket.ConnectionClosed:
                await clear(queue) # only the client is supposed to get queue
                if rqueue._getters:
                    await rqueue.put("connection closed by client")
                else:
                    await clear(rqueue)

            
async def main():
    async with serve(clientc, "127.0.0.1", 9000) as server:
        await server.serve_forever()

if __name__ == "__main__":
    asyncio.run(main())