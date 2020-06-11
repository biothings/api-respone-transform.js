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
                association: {
                    input: "name",
                    predicate: 'related_to'
                },
                response_mapping: {
                    sookie: "kevin"
                }
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

describe("test base transformer", () => {

    let api_response;

    beforeAll(async () => {
        let res = await axios.get("http://ctdbase.org/tools/batchQuery.go?inputType=chem&inputTerms=D003634|mercury&report=diseases_curated&format=json");
        api_response = res.data;
    });

    test("test base wrapper", () => {
        let input = {
            response: api_response,
            edge: {
                input: "D003634",
                association: {
                    output_type: "Gene",
                    predicate: "related_to"
                },
                response_mapping: {
                    MESH: "data.DiseaseID",
                    name: "data.DiseaseName",
                    pubmed: "data.PubMedIDs"
                }
            }
        }
        let tf = new ctd_tf(input);
        let res = tf.wrap(api_response);
        res = tf.jsonTransform(res);
        expect(res).toHaveProperty("related_to");
    })
})