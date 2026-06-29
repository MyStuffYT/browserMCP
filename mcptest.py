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
        result = await client.call_tool("simple_history_get", {"text": "js", "maxResults": 100, "start": 1, "end": 24})
        print(result)

asyncio.run(call_tool())
