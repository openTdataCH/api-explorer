# opentransportdata.swiss API-Explorer

This repo allows to browse the OpenAPI specs for [opentransportdata.swiss](https://opentransportdata.swiss/en/). It publishes a simple site (via GitHub Pages) where each API is rendered with **Swagger UI** so you can read endpoints, schemas, and pre-authorized try requests directly from the browser.

URL: https://opentdatach.github.io/api-explorer/

## Local Preview

```bash
$ npm install

# generates dist/ from the templates + config
$ npm run build     

# runs at http://localhost:8080
$ npm run serve     
```

## Adds a new API

- get the token (API key) for the new service - https://api-manager.opentransportdata.swiss/

- create a new secret in the repo https://github.com/openTdataCH/api-explorer/settings/secrets/actions

- add the key name as a placeholder the `.env` file and with real value in the `.env.local` file (this is ignored by Git)
```
# .env (commited, in the repo)
API_KEY_NEWAPI=PLACEHOLDER

# .env.local (file excluded from Git)
API_KEY_NEWAPI=eyJvcmciOiI2NDA....
```

- add a new entry in [apis.yaml](./apis.yaml). the id used will be used in the permalink URL, i.e. for `ojp1.0` the URL + path is https://opentdatach.github.io/api-explorer/ojp1.0/

```
apis:
  - id: new_service
    title: New Service
    map_secrets:
      API_KEY: API_KEY_OJPFARE
...
```

- duplicate any of the folders in `openapi/` folder as `openapi/new_service`. 

- edit the OpenAPI specs in `openapi/new_service/openapi.template.yaml` file 

- run `npm build` and inspect the `dist` folder

## Deployment

A GitHub Actions workflow (under [.github/workflows/publish-swagger.yml](./.github/workflows/publish-swagger.yml)) builds the site and publishes it to GitHub Pages on push to the default branch

## License

The project is released under a [MIT license](./LICENSE.txt).

Copyright (c) 2025 Open Data Platform Mobility Switzerland - [opentransportdata.swiss](https://opentransportdata.swiss/en/).
