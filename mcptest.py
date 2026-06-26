# copied from fastmcp's documentation
import asyncio
from fastmcp import Client
from fastmcp.client.transports import StdioTransport

transport = StdioTransport(command='node', args=["/home/stuff/browserMCP/index.js"])
client = Client(transport)

async def call_tool():
    async with client:
        print("done")
        await asyncio.to_thread(input, "press enter to call tool\n")
        result = await client.call_tool("tabs")
        print(result)

asyncio.run(call_tool())
