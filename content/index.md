# Iridium

Iridium is a small set of packages for building a browser-facing web proxy: load and validate
configuration, open connections safely, and serve everything from one Node process.

| Package                                                           | What it is                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------- |
| [`config`](https://github.com/Iridium-Group/iridium-config)       | Load, validate and override configuration, with a JSON Schema |
| [`utils`](https://github.com/Iridium-Group/iridium-utils)         | URL, address, header, JSON and timing helpers                 |
| [`transport`](https://github.com/Iridium-Group/iridium-transport) | Direct, Wisp and in-memory transports with an address policy  |
| [`proxy`](https://github.com/Iridium-Group/iridium-proxy)         | The server: static files plus a Wisp endpoint                 |
| [`inspector`](https://github.com/Iridium-Group/iridium-inspector) | CLI that checks a config and what it does with a URL          |
| [`examples`](https://github.com/Iridium-Group/iridium-examples)   | Runnable examples for each package                            |

Start with [Getting started](getting-started.html).
