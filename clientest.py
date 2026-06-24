# i copy this from the documentation :D
from websockets.sync.client import connect

def hello():
    uri = "ws://localhost:9000"
    with connect(uri) as websocket:
        while True:
            i = input()
            websocket.send(i)
            r = websocket.recv()
            print(r)


if __name__ == "__main__":
    hello()
