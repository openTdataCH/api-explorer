# opentransportdata.swiss API-Explorer

This repo allows to browse the OpenAPI specs for [opentransportdata.swiss](https://opentransportdata.swiss/en/). It publishes a simple site (via GitHub Pages) where each API is rendered with **Swagger UI** so you can read endpoints, schemas, and pre-authorized try requests directly from the browser.

URL: https://opentdatach.github.io/api-explorer/

## Local Development

```bash
$ npm install

# duplicate local API credential file
$ cp ./src/app/config/api-tokens.ts ./src/app/config/api-tokens.local.ts

# edit api-tokens.local.ts
# fill with tokens obtained from https://api-manager.opentransportdata.swiss/

# develop on localhost
$ ng serve

# open http://localhost:4200
```

## Adds a new API

- get the token (API key) for the new service - https://api-manager.opentransportdata.swiss/
- update config in 
    - [./src/app/config/api-config.ts](./src/app/config/api-config.ts)
    - [./src/app/config/api-tokens.local.ts](./src/app/config/api-tokens.local.ts)
    - [./src/app/config/api-tokens.ts](./src/app/config/api-tokens.ts)
- duplicate and edit one of the existing OpenAPI specs - [./public/openapi](./public/openapi)

## Deployment

A GitHub Actions workflow (under [.github/workflows/deploy-pages.yml](./.github/workflows/deploy-pages.yml)) builds the site and publishes it to GitHub Pages on push to the default branch

## License

The project is released under a [MIT license](./LICENSE.txt).

Copyright (c) 2025 - 2026 Open Data Platform Mobility Switzerland - [opentransportdata.swiss](https://opentransportdata.swiss/en/).
