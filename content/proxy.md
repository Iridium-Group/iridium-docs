# Proxy

`@iridium-group/proxy` serves static files and a Wisp v1 WebSocket endpoint, and applies the
`security` section of your config to every stream.

```sh
npx iridium-proxy [config-file]
```

`PORT` is honoured when `IRIDIUM_SERVER__PORT` is not set.

| Path                | What it does                                  |
| ------------------- | --------------------------------------------- |
| `/healthz`          | `{"status":"ok"}` for load balancers          |
| `server.wispPath`   | Wisp WebSocket endpoint (plain HTTP gets 426) |
| `server.basePath/*` | Static files from `server.staticDir`          |

## How a stream is checked

1. The port is checked against `blockedPorts` and `allowedPorts`.
2. The host is resolved. If any answer is private (and `blockPrivateAddresses` is on) the stream is
   refused with close reason `0x48`.
3. The connection goes to the address that was checked, not the hostname, so a second DNS lookup
   cannot return something different.

## Hosting

The Wisp endpoint is a long-lived WebSocket that opens raw TCP connections, so it needs a host
that runs a persistent Node process: a VM, a container platform, Fly.io, Railway or Render. It
cannot run on Vercel's serverless functions. Host a static front end on Vercel if you like and
point `transport.url` at the proxy.

Use TLS in front of it so clients can use `wss://`, and keep `blockPrivateAddresses` on for any
server reachable from the internet.
