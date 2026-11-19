# Config API reference

All exports come from `@iridium-group/config`. `@iridium-group/config/validate` exports
`validateConfig`, `isValidConfig` and `isPlainObject` without importing any `node:` module, for
browsers. `@iridium-group/config/schema.json` is the JSON Schema file.

## Loading

### `loadConfig(source?, options?): Promise<IridiumConfig>`

`source` is a file path (resolved against `options.cwd`), a `file:` URL, or an
`IridiumConfigInput` object. With no source: the file named by `IRIDIUM_CONFIG`, else
`iridium.config.json` in `cwd` if it exists, else defaults and environment only.

Reads the file, parses it as JSONC, applies environment overrides, validates, and fills defaults.
Throws `ConfigError`. Never mutates an object source.

### `loadConfigSync(source?, options?): IridiumConfig`

The same, with synchronous file reads.

### `resolveConfig(input, options?): IridiumConfig`

The steps after parsing: environment overrides, validation, defaults. No file system access.
`options.source` is used in error messages.

### `LoadConfigOptions`

| Field       | Type                                             | Default         |
| ----------- | ------------------------------------------------ | --------------- |
| `env`       | `Record<string, string \| undefined>` or `false` | `process.env`   |
| `envPrefix` | `string`                                         | `"IRIDIUM_"`    |
| `cwd`       | `string`                                         | `process.cwd()` |

### `defineConfig(input): IridiumConfigInput`

Returns its argument. Gives config objects written in TypeScript type checking and completion.

## Validation

### `validateConfig(input: unknown): ConfigIssue[]`

Checks config input (before defaults) and returns every issue, in document order, with the
`transport.url` requirement last. An empty array means valid. Accepts exactly what
`schema/iridium.schema.json` accepts.

### `isValidConfig(input): input is IridiumConfigInput`

`validateConfig(input).length === 0`.

### `applyDefaults(input?): IridiumConfig`

Fills every missing setting. Expects valid input. Returns fresh arrays; never mutates.

## Parsing

### `parseJsonc(text, source?): unknown`

Parses JSON with comments, trailing commas and an optional BOM. Throws `ConfigError` with a line
and column for syntax errors, and for empty files and unterminated block comments.

### `stripJsonComments(text): string`

Replaces comments and trailing commas with spaces, keeping every other character in place.

## Environment

### `applyEnvOverrides(input, env, prefix?): EnvOverrideResult`

Returns `{ input, issues, applied }`: a copy of `input` with overrides applied, the problems
found (unknown names, unconvertible values), and a `Map` from config path to variable name.

### `envOverrides(prefix?): EnvOverride[]`

Every supported variable: `{ name, path, section, key, kind }`, in config order.

### `toEnvSegment(key): string`

`"connectTimeoutMs"` to `"CONNECT_TIMEOUT_MS"`.

### Constants

- `DEFAULT_ENV_PREFIX`: `"IRIDIUM_"`.
- `CONFIG_PATH_ENV`: `"IRIDIUM_CONFIG"`.
- `DEFAULT_CONFIG_FILE`: `"iridium.config.json"`.
- `CONFIG_EXTENSIONS`: `[".json", ".jsonc"]`.

## Errors

### `class ConfigError extends Error`

`new ConfigError(issues, { source?, cause? })`. Properties: `issues` (frozen `ConfigIssue[]`),
`source` (file path or `undefined`), `name` (`'ConfigError'`), `message` (see
`formatIssues`), `cause` (the underlying read or parse error, when there is one).

### `ConfigIssue`

| Field     | Type     | Notes                                                                   |
| --------- | -------- | ----------------------------------------------------------------------- |
| `path`    | `string` | `server.port`, `security.blockedPorts[1]`, `env.IRIDIUM_X__Y`, or `''`. |
| `message` | `string` | Reads after the path: `must be an integer, got "8080"`.                 |

### `formatIssues(issues, source?): string`

The text of `ConfigError.message`: a header line, then `  - path: message` per issue, with
`(root)` for an empty path.

### `isConfigError(value): value is ConfigError`

## Types and constants

- `IridiumConfig`: `{ server, transport, security, logging }` with every default filled.
- `IridiumConfigInput`: what a file may contain; every section and setting optional, plus `$schema`.
- `ServerConfig`, `TransportConfig`, `SecurityConfig`, `LoggingConfig`: the sections.
- `TransportType` (`'direct' | 'wisp' | 'memory'`), `LogLevel`, `LogFormat`.
- `DEFAULT_CONFIG`: deeply frozen defaults. `DEFAULT_BLOCKED_PORTS`: `[25, 465, 587]`.
- `CONFIG_FIELDS`: section to setting to kind (`'string' | 'integer' | 'boolean' | 'portList'`).
- `CONFIG_SECTIONS`, `TRANSPORT_TYPES`, `LOG_LEVELS`, `LOG_FORMATS`.
