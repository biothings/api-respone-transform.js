/**
 * @jest-environment node
 */

const biolink_tf = require("../transformers/biolink_transformer");
const semmed_tf = require("../transformers/semmed_transformer");
const cord_tf = require("../transformers/cord_transformer");
const ctd_tf = require("../transformers/ctd_transformer");
const opentarget_tf = require("../transformers/opentarget_transformer");
const automat_tf = require("../transformers/automat_transformer");
const biothings_tf = require("../transformers/biothings_transformer");
const base_tf = require("../transformers/transformer");
const axios = require("axios");

describe("test biolink transformer", () => {

    let api_response;

    beforeAll(async () => {
        let res = await axios.get("https://api.monarchinitiative.org/api/bioentity/disease/DOID%3A678/genes?rows=100&facet=false&unselect_evidence=false&exclude_automatic_assertions=false&fetch_objects=false&use_compact_associations=false&direct=false&direct_taxon=false&association_type=both");
        api_response = res.data;
    });



    test("test biolink wrapper", () => {
        let input = {
            response: api_response,
            edge: {
                "input": "DOID:678",
                "query_operation": {
                    "params": {
                        "disease_id": "{inputs[0]}",
                        "rows": 200
                    },
                    "path": "/bioentity/disease/{disease_id}/genes",
                    "path_params": [
                        "disease_id"
                    ],
                    "method": "get",
                    "server": "https://api.monarchinitiative.org/api",
                    "tags": [
                        "anatomy",
                        "disease",
                        "gene",
                        "phenotype",
                        "pathway",
                        "annotation",
                        "query",
                        "translator",
                        "biolink"
                    ],
                    "supportBatch": false
                },
                "association": {
                    "input_id": "MONDO",
                    "input_type": "Disease",
                    "output_id": "NCBIGene",
                    "output_type": "Gene",
                    "predicate": "related_to",
                    "api_name": "BioLink API",
                    "smartapi": {
                        "id": "d22b657426375a5295e7da8a303b9893",
                        "meta": {
                            "ETag": "62f25b12c5457f6924db7929d91e7d5a2e70de291e7672aebf06fa08d1526d9d",
                            "github_username": "newgene",
                            "timestamp": "2020-05-28T00:02:40.483712",
                            "uptime_status": "good",
                            "uptime_ts": "2020-06-11T00:05:38.030503",
                            "url": "https://raw.githubusercontent.com/NCATS-Tangerine/translator-api-registry/master/biolink/openapi.yml"
                        }
                    }
                },
                "response_mapping": {
                    "related_to": {
                        "NCBIGene": "associations.object.NCBIGene",
                        "pubmed": "associations.publications.id",
                        "relation": "associations.relation.label",
                        "source": "associations.provided_by",
                        "taxid": "associations.object.taxon.id"
                    }
                },
                "id": "01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b"
            }
        }
        let tf = new biolink_tf(input);
        let res = tf.wrap(api_response);
        expect(res.associations[0]['object']['HGNC']).toBe("10956")
    })
})

describe("test semmed transformer", () => {

    let api_response, input;

    beforeEach(async () => {
        let res = await axios({
            method: 'post',
            url: 'https://biothings.ncats.io/semmedgene/query',
            data: 'q=C1332823, C1332824, 123&scopes=umls',
            params: {
                fields: 'name,umls,positively_regulates',
                size: '5'
            }
        })
        api_response = res.data;
        input = {
            response: api_response,
            edge: {
                "input": ["C1332824", "C1332823", "123"],
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
    });

    test("test semmed pairInputWithAPIResponse", () => {
        let tf = new semmed_tf(input);
        let res = tf.pairInputWithAPIResponse();
        expect(res["UMLS:C1332823"][0]['umls']).toBe("C1332823");
        expect(res).toHaveProperty('UMLS:C1332823');
        expect(res["UMLS:123"]).toBeUndefined();
    });

    test("test wrapper", () => {
        let tf = new semmed_tf(input);
        let res = tf.wrap(input.response[0]);
        expect(res).toHaveProperty("positively_regulates");
    });

    test("test json transform", () => {
        let tf = new semmed_tf(input);
        let res = tf.jsonTransform(input.response[0]);
        expect(res).toEqual(input.response[0]);
    });

    test("add edge info", () => {
        let tf = new semmed_tf(input);
        let res = tf.pairInputWithAPIResponse();
        let rec = res["UMLS:C1332823"][0];
        rec = tf.wrap(rec);
        let result = tf.addEdgeInfo("UMLS:C1332823", rec["positively_regulates"][0]);
        expect(result[0]).toHaveProperty("$association");
        expect(result[0].$association.api_name).toBe("SEMMED Gene API")
    });

    test("test main function transform", () => {
        let tf = new semmed_tf(input);
        let res = tf.transform();
        expect(res[0]).toHaveProperty('UMLS');
        expect(res[0]).toHaveProperty("$association");
        expect(res[0]).toHaveProperty("$input", "UMLS:C1332823");
        expect(res.slice(-1)[0]).toHaveProperty("$input", "UMLS:C1332824");
        expect(res.length).toBeGreaterThan(30);
    })

})

describe("test cord transformer", () => {

    let api_response, input;

    beforeAll(async () => {
        let res = await axios({
            method: 'post',
            url: 'https://biothings.ncats.io/cord_gene/query',
            data: 'q=238, 239, 240&scopes=hgnc',
            params: {
                fields: 'associated_with'
            }
        })
        api_response = res.data;
        input = {
            response: api_response,
            edge: {
                "input": ["238", "239", "240"],
                "query_operation": {
                    "params": {
                        "fields": "associated_with"
                    },
                    "request_body": {
                        "body": {
                            "q": "{inputs[0]}",
                            "scopes": "hgnc"
                        },
                        "header": "application/x-www-form-urlencoded"
                    },
                    "path": "/query",
                    "path_params": [],
                    "method": "post",
                    "server": "https://biothings.ncats.io/cord_gene",
                    "tags": [
                        "gene",
                        "annotation",
                        "query",
                        "translator",
                        "biothings"
                    ],
                    "supportBatch": true,
                    "inputSeparator": ","
                },
                "association": {
                    "input_id": "HGNC",
                    "input_type": "Gene",
                    "output_id": "HGNC",
                    "output_type": "Gene",
                    "predicate": "related_to",
                    "source": "Translator Text Mining Provider",
                    "api_name": "CORD Gene API",
                    "smartapi": {
                        "id": "6bc54230a6fa7693b2cd113430387ca7",
                        "meta": {
                            "ETag": "5e7512d15d24b57b52cb15604aaa6c24192f48ef00da9732f23aab3707b2061b",
                            "github_username": "kevinxin90",
                            "timestamp": "2020-04-29T00:00:40.725359",
                            "uptime_status": "good",
                            "uptime_ts": "2020-06-12T00:05:25.251375",
                            "url": "https://raw.githubusercontent.com/NCATS-Tangerine/translator-api-registry/master/cord/cord_gene.yml"
                        }
                    }
                },
                "response_mapping": {
                    "related_to": {
                        "HGNC": "associated_with.hgnc",
                        "pmc": "associated_with.pmc"
                    }
                },
                "id": "01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b"
            }
        }
    });

    test("test cord pairInputWithAPIResponse", () => {
        let tf = new cord_tf(input);
        let res = tf.pairInputWithAPIResponse();
        expect(res).toHaveProperty('HGNC:240');
        expect(res["HGNC:239"]).toBeUndefined();
    });

    test("test wrapper", () => {
        let tf = new cord_tf(input);
        let res = tf.wrap(input.response[0]);
        expect(res).toHaveProperty("related_to");
        expect(res.related_to[0]['@type']).toBe("Gene");
    });

    test("test json transform", () => {
        let tf = new cord_tf(input);
        let res = tf.jsonTransform(input.response[0]);
        expect(res).toEqual(input.response[0]);
    });

    test("add edge info", () => {
        let tf = new cord_tf(input);
        let res = tf.pairInputWithAPIResponse();
        let rec = res["HGNC:238"][0];
        rec = tf.wrap(rec);
        let result = tf.addEdgeInfo("HGNC:238", rec["related_to"][0]);
        expect(result[0]).toHaveProperty("$association");
        expect(result[0].$association.api_name).toBe("CORD Gene API")
    });

    test("test main function transform", () => {
        let tf = new cord_tf(input);
        let res = tf.transform();
        expect(res[0]).toHaveProperty('HGNC');
        expect(res[0]).toHaveProperty("$association");
        expect(res[0]).toHaveProperty("$input", "HGNC:238");
        expect(res.slice(-1)[0]).toHaveProperty("$input", "HGNC:240");
        expect(res.length).toBeGreaterThan(30);
    })
})

describe("test opentarget transformer", () => {

    let api_response;

    beforeAll(async () => {
        let res = await axios.get("https://platform-api.opentargets.io/v3/platform/public/evidence/filter?target=ENSG00000088832&size=100&fields=drug&datasource=chembl");
        api_response = res.data;
    });

    test("test opentarget wrapper", () => {
        let input = {
            response: api_response,
            edge: {
                input: "238",
                association: {
                    output_type: "Gene"
                },
                response_mapping: {
                    sookie: "kevin"
                }
            }
        }
        let tf = new opentarget_tf(input);
        let res = tf.wrap(api_response);
        expect(res.data[0]['drug']['id']).toBe("CHEMBL1200686");
        expect(res.data[0]['drug']['molecule_name']).toContain("PIMECROLIMUS");
    })
})

describe("test automat transformer", () => {

    let api_response;

    beforeAll(async () => {
        let res = await axios.get("https://automat.renci.org/cord19_scibite_v2/chemical_substance/disease/CHEBI:6601");
        api_response = res.data;
    });

    test("test automat wrapper", () => {
        let input = {
            response: api_response,
            edge: {
                input: "238",
                association: {
                    output_type: "Gene"
                },
                response_mapping: {
                    sookie: "kevin"
                }
            }
        }
        let tf = new automat_tf(input);
        let res = tf.wrap(api_response);
        expect(res.associated_with.mondo).toContain("MONDO:0005233");
    })
})

describe("test ctd transformer", () => {

    let api_response;

    beforeAll(async () => {
        let res = await axios.get("http://ctdbase.org/tools/batchQuery.go?inputType=chem&inputTerms=D003634|mercury&report=diseases_curated&format=json");
        api_response = res.data;
    });

    test("test ctd wrapper", () => {
        let input = {
            response: api_response,
            edge: {
                input: "238",
                association: {
                    output_type: "Gene"
                },
                response_mapping: {
                    sookie: "kevin"
                }
            }
        }
        let tf = new ctd_tf(input);
        let res = tf.wrap(api_response);
        expect(res.data[0]['DiseaseID']).toBe("D000022");
        expect(res.data[0]['PubMedIDs']).toContain("16120699");
    })
})


describe("test biothings transformer", () => {

    let api_response;
    let input;

    beforeAll(async () => {
        let res = await axios({
            method: 'post',
            url: 'https://biothings.ncats.io/semmedgene/query',
            data: 'q=C1332823, C1332824, 123&scopes=umls',
            params: {
                fields: 'name,umls,positively_regulates',
                size: '5'
            }
        })
        api_response = res.data;
        input = {
            response: api_response,
            edge: {
                "input": ["C1332824", "C1332823", "123"],
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
    });

    test("test biothings pairInputWithAPIResponse", () => {
        let tf = new biothings_tf(input);
        let res = tf.pairInputWithAPIResponse();
        expect(res["UMLS:C1332823"][0]['umls']).toBe("C1332823");
        expect(res).toHaveProperty('UMLS:C1332823');
        expect(res["123"]).toBeUndefined();
    });

    test("test wrapper", () => {
        let tf = new biothings_tf(input);
        let res = tf.wrap(input.response[0]);
        expect(res).toHaveProperty("query");
    });

})

describe("test base transformer using dgidb API", () => {

    let api_response;
    let input;

    beforeAll(async () => {
        let res = await axios.get("http://www.dgidb.org/api/v2/interactions.json?genes=CXCR3");
        api_response = res.data;
        input = {
            response: api_response,
            edge: {
                "input": "CXCR3",
                "query_operation": {
                    "params": {
                        "genes": "{inputs[0]}"
                    },
                    "path": "/interactions.json",
                    "path_params": [],
                    "method": "get",
                    "server": "http://dgidb.genome.wustl.edu/api/v2",
                    "tags": [
                        "drug",
                        "gene",
                        "annotation",
                        "translator"
                    ],
                    "supportBatch": false
                },
                "association": {
                    "input_id": "SYMBOL",
                    "input_type": "Gene",
                    "output_id": "CHEMBL.COMPOUND",
                    "output_type": "ChemicalSubstance",
                    "predicate": "physically_interacts_with",
                    "api_name": "DGIdb API",
                    "smartapi": {
                        "id": "e3edd325c76f2992a111b43a907a4870",
                        "meta": {
                            "ETag": "ed2cc061d10f35a20862b542ebc7b421d176bb58906ba2300b99e88017527f9d",
                            "github_username": "newgene",
                            "timestamp": "2020-04-29T00:02:09.170360",
                            "uptime_status": "good",
                            "uptime_ts": "2020-06-11T00:05:22.359624",
                            "url": "https://raw.githubusercontent.com/NCATS-Tangerine/translator-api-registry/master/dgidb/openapi.yml"
                        }
                    }
                },
                "response_mapping": {
                    "physically_interacts_with": {
                        "CHEMBL.COMPOUND": "matchedTerms.interactions.drugChemblId",
                        "name": "matchedTerms.interactions.drugName",
                        "publication": "matchedTerms.interactions.pmids",
                        "source": "matchedTerms.interactions.sources"
                    }
                },
                "id": "01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b"
            }
        }
    });

    test("test pairInputWithAPIResponse", () => {
        let tf = new base_tf(input);
        let res = tf.pairInputWithAPIResponse();
        expect(res).toHaveProperty("SYMBOL:CXCR3");
        expect(res["SYMBOL:CXCR3"]).toBeInstanceOf(Array);
        expect(res["SYMBOL:CXCR3"][0]).toHaveProperty("matchedTerms");
    });

    test("test wrapper", () => {
        let tf = new base_tf(input);
        let res = tf.wrap(input.response);
        expect(res).toHaveProperty("matchedTerms");
    });

    test("test json transform", () => {
        let tf = new base_tf(input);
        let res = tf.jsonTransform(input.response);
        expect(res).toHaveProperty("physically_interacts_with");
        expect(res["physically_interacts_with"][0]['CHEMBL.COMPOUND']).toBe("CHEMBL351042");
        expect(res["physically_interacts_with"]).toHaveLength(input.response.matchedTerms[0]['interactions'].length);
    });

    test("add edge info", () => {
        let tf = new base_tf(input);
        let res = tf.jsonTransform(input.response);
        let rec = res["physically_interacts_with"][0];
        let result = tf.addEdgeInfo(input.edge.input, rec);
        expect(result[0]).toHaveProperty("$association");
        expect(result[0].$association.api_name).toBe("DGIdb API")
    });

    test("test main function transform", () => {
        let tf = new base_tf(input);
        let res = tf.transform();
        expect(res).toHaveLength(input.response.matchedTerms[0]['interactions'].length);
    })
})