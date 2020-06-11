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

    let api_response;

    beforeAll(async () => {
        let res = await axios.get("https://biothings.ncats.io/semmedgene/query?q=CDK7");
        api_response = res.data.hits[0];
    });

    test("test semmed wrapper with output as gene", () => {
        let input = {
            response: api_response,
            edge: {
                input: "CDK7",
                association: {
                    output_type: "Gene"
                },
                response_mapping: {
                    sookie: "kevin"
                }
            }
        }
        let tf = new semmed_tf(input);
        let res = tf.wrap(api_response);
        expect(res.physically_interacts_with[0]['name']).toBe("CDK2 wt Allele");
        expect(res.physically_interacts_with[0]['UMLS']).toBe("C1707113");
        expect(res.physically_interacts_with[0]['pubmed']).toContain("10085115");
    })

    test("test semmed wrapper with output as disease", () => {
        let input = {
            response: api_response,
            edge: {
                input: "CDK7",
                association: {
                    output_type: "Disease"
                },
                response_mapping: {
                    sookie: "kevin"
                }
            }
        }
        let tf = new semmed_tf(input);
        let res = tf.wrap(api_response);
        expect(res.related_to[0]['name']).toBe("High weight");
        expect(res.related_to[0]['UMLS']).toBe("C0948775");
        expect(res.related_to[0]['pubmed']).toContain("9286668");
    })
})

describe("test cord transformer", () => {

    let api_response;

    beforeAll(async () => {
        let res = await axios.get("https://biothings.ncats.io/cord_gene/query?q=hgnc:238");
        api_response = res.data.hits[0];
    });

    test("test cord wrapper", () => {
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
        let tf = new cord_tf(input);
        let res = tf.wrap(api_response);
        expect(res.associated_with[0]['HGNC']).toBe("23483");
        expect(res.associated_with[0]['pmc']).toContain("PMC6759281");
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

    beforeAll(async () => {
        let res = await axios({
            method: 'post',
            url: 'https://biothings.ncats.io/semmedgene/query',
            data: 'q=CXCR4, 123&scopes=name, umls',
            params: {
                fields: 'name,umls',
                size: '5'
            }
        })
        api_response = res.data;
    });

    test("test biothings pairInputWithAPIResponse", () => {
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
        let tf = new biothings_tf(input);
        let res = tf.pairInputWithAPIResponse();
        expect(res.CXCR4[0]['umls']).toBe("C1332823");
        expect(res).toHaveProperty('CXCR4');
        expect(res["123"]).toBeUndefined();
    })
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
        expect(res).toHaveProperty("CXCR3");
        expect(res["CXCR3"]).toBeInstanceOf(Array);
        expect(res["CXCR3"][0]).toHaveProperty("matchedTerms");
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
        let result = tf.addEdgeInfo(rec);
        expect(result).toHaveProperty("association");
        expect(result.association.api_name).toBe("DGIdb API")
    });

    test("test main function transform", () => {
        let tf = new base_tf(input);
        let res = tf.transform();
        expect(res).toHaveProperty("CXCR3");
        expect(res["CXCR3"][0]).toHaveProperty("physically_interacts_with")
    })
})