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

## Placeholders

- the OpenAPI specs in [./public/openapi](./public/openapi) contain placeholders that are dynamically replaced at render time
- the registry of placeholders is defined in [./src/app/detail/detail.ts](./src/app/detail/detail.ts)

```
const handlerLoaders: Record<PlaceHolderKey, () => Promise<PlaceholderModule>> = {
  today: () => import('./placeholders/today'),
  isoTimestamp: () => import('./placeholders/iso-timestamp'),
  RESPONSE_XML_LIR1: () => import('./placeholders/ojp-lir1'),
  RESPONSE_XML_TR1: () => import('./placeholders/ojp-tr1'),
  REQUEST_XML_FR1: () => import('./placeholders/ojp-fr1'),
  RESPONSE_XML_FR2: () => import('./placeholders/ojp-fr2'),
  REQUEST_XML_TRR1: () => import('./placeholders/ojp-trr1'),
};
```

- example of placeholder usage

```
<OJPTripInfoRequest>
    <siri:RequestTimestamp>{{isoTimestamp}}</siri:RequestTimestamp>
    <siri:MessageIdentifier>TIR-1a</siri:MessageIdentifier>
    <JourneyRef>ch:1:sjyid:100001:18355-001</JourneyRef>
    <OperatingDayRef>{{today}}</OperatingDayRef>
</OJPTripInfoRequest>
```

`{{today}}` string is replaced with content resolved in [./src/app/detail/placeholders/today.ts](./src/app/detail/placeholders/today.ts)

```
    summary: "11. Trip Refine Request"
    description: "TRR request for the first trip of Bern - Zurich TR request occuring next day after 10AM. The TR response XML is pre-fetched using ojp-sdk"
    value: | 
        {{REQUEST_XML_TRR1}}
```

`{{REQUEST_XML_TRR1}}` string is replaced with `ojp-sdk` TripRequest parsed in [./src/app/detail/placeholders/ojp-trr1.ts](./src/app/detail/placeholders/ojp-trr1.ts)

## Deployment

A GitHub Actions workflow (under [.github/workflows/deploy-pages.yml](./.github/workflows/deploy-pages.yml)) builds the site and publishes it to GitHub Pages on push to the default branch

## License

The project is released under a [MIT license](./LICENSE.txt).

Copyright (c) 2025 - 2026 Open Data Platform Mobility Switzerland - [opentransportdata.swiss](https://opentransportdata.swiss/en/).
