import { transform } from "../json_transform/index";
import { JSONDoc } from "../json_transform/types";
import { generateCurie, toArray } from "../utils";
import { BTEKGOperationObject, BTEQueryObject } from "../types";
import { Record } from "../record";
import { FrozenRecord } from "../record";
import * as _ from "lodash";
import Debug from "debug";
import async from "async";
const debug = Debug("bte:api-response-transform:transformer");

export default class BaseTransformer {
    protected edge: BTEKGOperationObject;
    protected data: BTEQueryObject;
    public config: any;

    constructor(data: BTEQueryObject, config: any) {
        this.data = data;
        this.edge = data.edge;
        this.config = config;
    }

    /**
     * Create an object with key representing input, and value representing the output of API
     */
    async pairCurieWithAPIResponse() {
        let input = generateCurie(
            this.edge.association.input_id,
            this.edge.input.hasOwnProperty('queryInputs') ? this.edge.input["queryInputs"] : this.edge.input as string
        );
        return {
            [input]: [this.data.response],
        };
    }

    /*
      if $edge.input | keys | contains(["queryInputs"]) then
        {[generateCurie($edge.association.input_id, $edge.input.queryInputs)]: .response}
      else
        {[generateCurie($edge.association.input_id, $edge.input)]: .response}
      end
    */

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

    _updatePublications(mappedResponse: any) {
        if ("pubmed" in mappedResponse) {
            mappedResponse.pubmed = toArray(mappedResponse.pubmed);
            mappedResponse.publications = mappedResponse.pubmed.map(item =>
                typeof item === "string" && item.toUpperCase().startsWith("PMID:") ? item.toUpperCase() : "PMID:" + item,
            );
            delete mappedResponse.pubmed;
        }
        if ("pmc" in mappedResponse) {
            mappedResponse.pmc = toArray(mappedResponse.pmc);
            mappedResponse.publications = mappedResponse.pmc.map(item =>
                typeof item === "string" && item.toUpperCase().startsWith("PMC:") ? item.toUpperCase() : "PMC:" + item,
            );
            delete mappedResponse.pmc;
        }
        return mappedResponse;
    }

    // _updateEdgeMetadata(res) {
    //     res.$edge_metadata = {
    //         ...this.edge.association,
    //         trapi_qEdge_obj: this.edge.reasoner_edge,
    //         filter: this.edge.filter,
    //     };
    //     return res;
    // }

    _getSubject(subjectCurie: any) {

        //debug(`input: ${input}`);
        let subject = {
            original: typeof this.edge.original_input === "undefined" ? undefined : this.edge.original_input[subjectCurie],
            // normalizedInfo:
            //     typeof this.edge.input_resolved_identifiers === "undefined" || typeof this.edge.original_input === "undefined"
            //     ? undefined
            //     : this.edge.input_resolved_identifiers[this.edge.original_input[subjectCurie]],
        }
        if (this.edge.input_resolved_identifiers && subject.original === undefined) {
            //try to find an equivalent ids object if the original input doesn't match (for ICEES)
            for (let curie of Object.keys(this.edge.input_resolved_identifiers)) {
                if (this.edge.input_resolved_identifiers[curie].equivalentIDs.includes(subjectCurie)) {
                    subject = {
                        original: curie,
                        // normalizedInfo: this.edge.input_resolved_identifiers[curie],
                    };
                    break;
                }
            }
        }
        return subject;
    }

    _removeNonEdgeData(mappedResponse: any) {
        delete mappedResponse["@type"];
        delete mappedResponse[this.edge.association.output_id];
        delete mappedResponse["input_name"];
        delete mappedResponse["output_name"];
        return mappedResponse;
    }

    /**
     * Add edge information into individual output JSON.
     * @param {Object} mappedResponse - JSON response representing an output.
     */
    async formatRecords(subjectCurie: string, mappedResponse: any) {
        if (mappedResponse === undefined || Object.keys(mappedResponse).length === 0) {
            return [];
        }

        // mappedResponse = this._updateEdgeMetadata(mappedResponse);
        const objectIDs = this.extractObjectIDs(mappedResponse);
        const outputName = mappedResponse.output_name;
        const inputName = mappedResponse.input_name; 
        mappedResponse = this._removeNonEdgeData(mappedResponse);
        mappedResponse = this._updatePublications(mappedResponse);

        const frozenRecord = {
            subject: {...this._getSubject(subjectCurie), apiLabel: inputName},
            association: {...this.edge.association},
            qEdge: this.edge.reasoner_edge,
            mappedResponse: {...mappedResponse},
        }

        let transformedRecords = await async.mapSeries(objectIDs, async (curie: string) => {

            let copyRecord = {
                ...frozenRecord,
                 object: {
                     original: curie,
                     apiLabel: outputName
                 }
            };
            return new Record(copyRecord, this.config, this.edge.association, this.edge.reasoner_edge);
        });
        return transformedRecords;
    }

    /**
     * Main function to transform API response
     */
    async transform() {
        let transformedRecords = [];
        let responses = await this.pairCurieWithAPIResponse();

        await async.eachSeries(Object.entries(responses), async ([curie, curieResponses]) => {
            if (Array.isArray(curieResponses) && curieResponses.length > 0) {
                await async.eachSeries(curieResponses, async response => {
                    const predicateResponse = this.jsonTransform(await this.wrap(response));
                    await async.eachSeries(Object.entries(predicateResponse), async ([predicate, mappedResponses]) => {
                        if (Array.isArray(mappedResponses) && mappedResponses.length > 0) {
                            await async.eachSeries(mappedResponses, async (mappedResponse: any[]) => {
                                transformedRecords.push(...(await this.formatRecords(curie, mappedResponse)));
                            });
                        } else {
                            transformedRecords.push(...(await this.formatRecords(curie, mappedResponses)));
                        }
                    });
                });
            }
        })
        return transformedRecords;
    }

    /**
     * Retrieve all output IDs.
     * @param {Object} mappedResponse - JSON response representing an output.
     */
    extractObjectIDs(mappedResponse: object) {
        const output_id_type = this.edge.association.output_id;
        if (!(output_id_type in mappedResponse)) {
            return [];
        }
        mappedResponse[output_id_type] = toArray(mappedResponse[output_id_type]);
        return mappedResponse[output_id_type].map((id: string) => generateCurie(output_id_type, id));
    }
}
