# Inspector

`@iridium-group/inspector` checks a config without starting anything or touching the network.

```sh
npx iridium-inspect config [file]
npx iridium-inspect url <url> [file]
```

- `config` loads the file (default `$IRIDIUM_CONFIG`, then `iridium.config.json`), applies
  `IRIDIUM_*` overrides, and prints every problem or the resolved settings. Exit code 1 if invalid.
- `url` says whether the config would let the proxy fetch a URL, with the reason for each rule.
  Exit code 1 if blocked.

Add `--json` for machine-readable output. Credentials in URLs are never printed.

`url` looks at the URL text only. A hostname that resolves to a private address is caught by the
proxy after DNS resolution, not by the inspector.
