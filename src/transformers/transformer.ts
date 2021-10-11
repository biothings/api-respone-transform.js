import { transform } from "../json_transform/index";
import { JSONDoc } from "../json_transform/types";
import { generateCurie, toArray } from "../utils";
import { BTEKGOperationObject, BTEQueryObject } from "../types";
import * as _ from "lodash";
import Debug from "debug";
import async from "async";
const debug = Debug("bte:api-response-transform:transformer");

export default class BaseTransformer {
    protected edge: BTEKGOperationObject;
    protected data: BTEQueryObject;

    constructor(data: BTEQueryObject) {
        this.data = data;
        this.edge = data.edge;
    }

    /**
     * Create an object with key representing input, and value representing the output of API
     */
    pairInputWithAPIResponse() {
        let input = generateCurie(this.edge.association.input_id, this.edge.input);
        return {
            [input]: [this.data.response],
        };
    }

    /**
     * Wrapper functions to transform API response before passing to JSON Transformer
     * @return {Object} - key is curie representing input, value is an array of outputs.
     */
    wrap(res) {
        if (Array.isArray(res)) {
            res = { data: res };
        }
        return res;
    }

    /**
     * Transform Individual JSON response into Biolink compatible format
     * @param {Object} res - JSON response representing an output.
     */
    jsonTransform(res: JSONDoc | JSONDoc[]) {
        res = transform(res, this.edge.response_mapping);
        return res;
    }

    _updatePublications(res) {
        if ("pubmed" in res) {
            res.pubmed = toArray(res.pubmed);
            res.publications = res.pubmed.map(item =>
                typeof item === "string" && item.toUpperCase().startsWith("PMID:") ? item.toUpperCase() : "PMID:" + item,
            );
            delete res.pubmed;
        }
        if ("pmc" in res) {
            res.pmc = toArray(res.pmc);
            res.publications = res.pmc.map(item =>
                typeof item === "string" && item.toUpperCase().startsWith("PMC:") ? item.toUpperCase() : "PMC:" + item,
            );
            delete res.pmc;
        }
        return res;
    }

    _updateEdgeMetadata(res) {
        res.$edge_metadata = {
            ...this.edge.association,
            trapi_qEdge_obj: this.edge.reasoner_edge,
            filter: this.edge.filter,
        };
        return res;
    }

    _updateInput(res, input) {
        //debug(`input: ${input}`);
        res.$input = {
        original: typeof this.edge.original_input === "undefined" ? undefined : this.edge.original_input[input],
        obj:
            typeof this.edge.input_resolved_identifiers === "undefined" || typeof this.edge.original_input === "undefined"
            ? undefined
            : this.edge.input_resolved_identifiers[this.edge.original_input[input]],
        };
        if (this.edge.input_resolved_identifiers && res.$input.original === undefined && res.$input.obj === undefined) {
        //try to find an equivalent ids object if the original input doesn't match (for ICEES)
        for (let curie of Object.keys(this.edge.input_resolved_identifiers)) {
            if (this.edge.input_resolved_identifiers[curie][0].curies.includes(input)) {
            res.$input = {
                original: curie,
                obj: this.edge.input_resolved_identifiers[curie],
            };
            break;
            }
        }
        }
        return res;
    }

    _removeNonEdgeData(res) {
        delete res["@type"];
        delete res[this.edge.association.output_id];
        return res;
    }

    /**
     * Add edge information into individual output JSON.
     * @param {Object} res - JSON response representing an output.
     */
    async addEdgeInfo(input, res) {
        if (res === undefined || Object.keys(res).length === 0) {
            return [];
        }
        res = this._updateEdgeMetadata(res);
        res = this._updateInput(res, input);
        const output_ids = this.extractOutputIDs(res);

        const setImmediatePromise = () => {
            return new Promise((resolve: any) => {
                setImmediate(() => resolve());
            });
        };

        let result = await async.mapSeries(output_ids, async item => {
            let blockingSince = Date.now();

            let copy_res = _.cloneDeep(res);
            if (blockingSince + (parseInt(process.env.SETIMMEDIATE_TIME) || 3) < Date.now()) {
              await setImmediatePromise();
              blockingSince = Date.now();
            }
            copy_res.$edge_metadata = res.$edge_metadata;
            copy_res.$output = {
                original: item,
            };
            copy_res = this._removeNonEdgeData(copy_res);
            copy_res = this._updatePublications(copy_res);
            return copy_res;
        });
        return result;
    }

    /**
     * Main function to transform API response
     */
    async transform() {
        let result = [];
        let responses = this.pairInputWithAPIResponse();

        await async.eachSeries(Object.keys(responses), async curie => {
        if (Array.isArray(responses[curie]) && responses[curie].length > 0) {
            await async.eachSeries(responses[curie], async item => {
            item = this.wrap(item);
            item = this.jsonTransform(item);
            await async.eachSeries(Object.keys(item), async predicate => {
                if (Array.isArray(item[predicate]) && item[predicate].length > 0) {
                await async.eachSeries(item[predicate], async (rec: any[]) => {
                    rec = await this.addEdgeInfo(curie, rec);
                    result.push(...rec);
                });
                } else {
                    result.push(...(await this.addEdgeInfo(curie, item[predicate])));
                }
            });
            });
        }
        });
        return result;
    }

    /**
     * Retrieve all output IDs.
     * @param {Object} res - JSON response representing an output.
     */
    extractOutputIDs(res) {
        const output_id_type = this.edge.association.output_id;
        if (!(output_id_type in res)) {
            return [];
        }
        res[output_id_type] = toArray(res[output_id_type]);
        return res[output_id_type].map(item => generateCurie(output_id_type, item));
    }
}
