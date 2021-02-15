![Test Coveralls](https://github.com/kevinxin90/api-respone-transform.js/workflows/Test%20Coveralls/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/kevinxin90/api-respone-transform.js/badge.svg?branch=master)](https://coveralls.io/github/kevinxin90/api-respone-transform.js?branch=master)
<a href="https://github.com/kevinxin90/api-respone-transform.js#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
<a href="https://www.npmjs.com/package/@biothings-explorer/api-response-transform" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/@biothings-explorer/api-response-transform.svg">
  </a>

# Welcome to @biothings-explorer/api-response-transform 👋

A NodeJS module to transform the JSON output from API into BioLink-compatible JSON structure

### 🏠 [Homepage](https://github.com/kevinxin90/api-respone-transform.js)

## Install

```sh
npm i @biothings-explorer/api-response-transform
```

## Usage

This package is desgined to be used as a downstream consumer of [@biothings-explorer/smartapi-kg](https://www.npmjs.com/package/@biothings-explorer/smartapi-kg) nodejs package. *@biothings-explorer/smartapi-kg* provides knowledge graph operation info, and when combined with API JSON response, can be consumed as input of the *@biothings-explorer/api-response-transform* package.

- Import and Initialize

    ```javascript
    const tf = require("@biothings-explorer/api-response-transform")
    const axios = require("axios");
    ```

- Transform

  - Get API Response

    ```javascript
    let res = await axios({
        method: 'post',
        url: 'https://biothings.ncats.io/semmedgene/query',
        data: 'q=C1332823, C1332824, 123&scopes=umls',
        params: {
            fields: 'name,umls,positively_regulates',
            size: '5'
        }
    });
    ```

  - Bind with edge info from @biothings-explorer/smartapi-kg

    ```javascript
    let input = {
        response: res.data,
        edge: {
            "input": ["C1332824", "C1332823"],
            "query_operation": {
                "params": {
                    "fields": "positively_regulates"
                },
                "request_body": {
                    "body": {
                        "q": "{inputs[0]}",
                        "scopes": "umls"
                    }
                },
                "path": "/query",
                "path_params": [],
                "method": "post",
                "server": "https://biothings.ncats.io/semmedgene",
                "tags": [
                    "disease",
                    "annotation",
                    "query",
                    "translator",
                    "biothings",
                    "semmed"
                ],
                "supportBatch": true,
                "inputSeparator": ","
            },
            "association": {
                "input_id": "UMLS",
                "input_type": "Gene",
                "output_id": "UMLS",
                "output_type": "Gene",
                "predicate": "positively_regulates",
                "source": "SEMMED",
                "api_name": "SEMMED Gene API",
                "smartapi": {
                    "id": "81955d376a10505c1c69cd06dbda3047",
                    "meta": {
                        "ETag": "f94053bc78b3c2f0b97f7afd52d7de2fe083b655e56a53090ad73e12be83673b",
                        "github_username": "kevinxin90",
                        "timestamp": "2020-05-27T16:53:40.804575",
                        "uptime_status": "good",
                        "uptime_ts": "2020-06-12T00:04:31.404599",
                        "url": "https://raw.githubusercontent.com/NCATS-Tangerine/translator-api-registry/master/semmed/semmed_gene.yaml"
                    }
                }
            },
            "response_mapping": {
                "positively_regulates": {
                    "pmid": "positively_regulates.pmid",
                    "umls": "positively_regulates.umls"
                }
            },
            "id": "01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b"
        }
    }
    ```

  - Transform into biolink-compatible format

    ```javascript
    let transformer = new tf(input);
    let res = transformer.transform();

    //returns [
    //{
    //  HGNC: '10956',
    //  pubmed: [ '21685912', '30089514', sequence: true ],
    //  relation: 'contributes to condition',
    //  source: [ 'https://archive.monarchinitiative.org/#gwascatalog' ],
    //  taxid: 'NCBITaxon:9606',
    //  '$reasoner_edge': undefined,
    //  '$association': {
    //    input_id: 'MONDO',
    //    input_type: 'Disease',
    //    output_id: 'HGNC',
    //    output_type: 'Gene',
    //    predicate: 'related_to',
    //    api_name: 'BioLink API',
    //    smartapi: [Object]
    //  },
    //  '$input': 'MONDO:678',
    //  '$output': 'HGNC:10956',
    //  '$original_input': undefined,
    //  '$input_resolved_identifiers': undefined,
    //  publications: [ 'PMID:21685912', 'PMID:30089514' ]
    //  },
    //  ...]
    ```

## Run tests

```sh
npm run test
```

## Author

👤 **Jiwen Xin**

* Website: http://github.com/kevinxin90
* Github: [@kevinxin90](https://github.com/kevinxin90)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/kevinxin90/api-respone-transform.js/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2020 [Jiwen Xin](https://github.com/kevinxin90).<br />
This project is [ISC](https://github.com/kevinxin90/api-respone-transform.js/blob/master/LICENSE) licensed.
