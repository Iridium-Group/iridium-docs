# Getting started

You need Node 22.18 or later. The packages are installed from GitHub:

```sh
npm install github:Iridium-Group/iridium-proxy github:Iridium-Group/iridium-config
```

## 1. Write a config

`iridium.config.json` (comments are allowed):

```jsonc
{
  "server": { "port": 8080, "staticDir": "public" },
  "transport": { "type": "direct" },
  "security": { "blockPrivateAddresses": true },
}
```

Every setting is optional. See the [configuration reference](config-reference.html).

## 2. Check it

```sh
npx iridium-inspect config
npx iridium-inspect url http://127.0.0.1/     # BLOCKED: private address
```

See [Inspector](inspector.html).

## 3. Run it

```sh
npx iridium-proxy
```

Static files are served from `staticDir`, the Wisp endpoint is at `/wisp/`, and `/healthz`
answers `{"status":"ok"}`. See [Proxy](proxy.html) for hosting.

## 4. Connect

```ts
import { WispClientTransport } from '@iridium-group/transport';

const transport = new WispClientTransport({ url: 'wss://your-host/wisp/' });
const conn = await transport.connect({ host: 'example.com', port: 443 });
```
