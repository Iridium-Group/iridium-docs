# Configuration reference

An Iridium config is a JSON object with up to four sections. Every section and setting is
optional; anything missing takes its default. Unknown sections and settings are errors.

Files may be `.json` or `.jsonc`. Both accept `//` and `/* */` comments and trailing commas.

## Settings

| Setting                          | Variable                                    | Default          |
| -------------------------------- | ------------------------------------------- | ---------------- |
| `server.host`                    | `IRIDIUM_SERVER__HOST`                      | `"0.0.0.0"`      |
| `server.port`                    | `IRIDIUM_SERVER__PORT`                      | `8080`           |
| `server.basePath`                | `IRIDIUM_SERVER__BASE_PATH`                 | `"/"`            |
| `server.wispPath`                | `IRIDIUM_SERVER__WISP_PATH`                 | `"/wisp/"`       |
| `server.staticDir`               | `IRIDIUM_SERVER__STATIC_DIR`                | `"public"`       |
| `transport.type`                 | `IRIDIUM_TRANSPORT__TYPE`                   | `"direct"`       |
| `transport.url`                  | `IRIDIUM_TRANSPORT__URL`                    | not set          |
| `transport.connectTimeoutMs`     | `IRIDIUM_TRANSPORT__CONNECT_TIMEOUT_MS`     | `10000`          |
| `security.blockPrivateAddresses` | `IRIDIUM_SECURITY__BLOCK_PRIVATE_ADDRESSES` | `true`           |
| `security.blockedPorts`          | `IRIDIUM_SECURITY__BLOCKED_PORTS`           | `[25, 465, 587]` |
| `security.allowedPorts`          | `IRIDIUM_SECURITY__ALLOWED_PORTS`           | not set          |
| `logging.level`                  | `IRIDIUM_LOGGING__LEVEL`                    | `"info"`         |
| `logging.format`                 | `IRIDIUM_LOGGING__FORMAT`                   | `"pretty"`       |

## `server`

Read by Iridium servers such as `iridium-proxy`.

- `host` (string, no whitespace): interface to listen on. `"0.0.0.0"` listens on every IPv4
  interface; use `"127.0.0.1"` behind a reverse proxy.
- `port` (integer, 0 to 65535): TCP port. `0` lets the operating system pick a free port.
- `basePath` (URL path): prefix the server is mounted under. Must start with `/` and contain no
  whitespace, `?` or `#`.
- `wispPath` (URL path): path of the Wisp WebSocket endpoint, same rules as `basePath`. It is an
  absolute path: with `basePath: "/proxy/"` you would usually set `wispPath: "/proxy/wisp/"`.
- `staticDir` (non-empty string): directory of static client files. Returned as written; the
  server resolves relative paths.

## `transport`

How connections are opened. Pass it to `createTransport()` from `@iridium-group/transport`.

- `type`: `"direct"` (TCP/TLS from Node, checked by the `security` policy), `"wisp"` (through a
  Wisp server, which enforces its own policy) or `"memory"` (in-process, for tests).
- `url` (string): `ws://` or `wss://` URL of the Wisp server. Required when `type` is `"wisp"`,
  allowed (and unused) otherwise.
- `connectTimeoutMs` (integer, 1 to 300000): connect timeout in milliseconds.

## `security`

The address policy for direct connections. Same fields as `AddressPolicy` in
`@iridium-group/transport`.

- `blockPrivateAddresses` (boolean): reject targets that are, or resolve to, private or
  special-purpose addresses (loopback, RFC 1918, link-local, cloud metadata and so on).
- `blockedPorts` (array of unique integers 1 to 65535): always rejected. `[]` blocks nothing.
- `allowedPorts` (array of unique integers 1 to 65535): when set, only these ports are accepted.
  Leave it out to allow every port that is not blocked. The blocked list is checked first.

## `logging`

- `level`: `"silent"`, `"error"`, `"warn"`, `"info"` or `"debug"`.
- `format`: `"pretty"` for people, `"json"` for one JSON object per line.

## Environment variables

- Name: `IRIDIUM_` + section + `__` + setting, with camelCase turned into `SCREAMING_SNAKE`
  (`connectTimeoutMs` becomes `CONNECT_TIMEOUT_MS`). The prefix can be changed with the
  `envPrefix` option.
- Values: integers as digits; booleans as `true`/`false`, `1`/`0`, `yes`/`no` or `on`/`off`
  (any case); port lists as `80,443` or a JSON array `[80,443]` (`[]` for an empty list); strings
  as written, with surrounding whitespace trimmed.
- Empty variables are ignored, so `IRIDIUM_SERVER__PORT=` does not clear the port.
- Names without `__` after the prefix are not overrides. `IRIDIUM_CONFIG` names the config file
  for `loadConfig()` with no argument.
- An `IRIDIUM_*__*` name that is not a setting, or a value that cannot be converted, is reported
  in the `ConfigError` like any other issue.

## Precedence

1. Defaults (`DEFAULT_CONFIG`).
2. The config file, or the object passed to `loadConfig()`.
3. Environment variables.

Validation runs once, on the file merged with the environment, before defaults are applied.
