from fastmcp import FastMCP
from websockets.sync.client import connect
import asyncio

mcp = FastMCP("browserMCP")

ws = connect("ws://localhost:9000")

@mcp.tool
def test(ping: str):
    ws.send("server")
    return f"{ping}: Pong"

if __name__ == "__main__":
    try:
        mcp.run(transport="http", host="127.0.0.1", port=8000)
    except KeyboardInterrupt:
        ws.close()