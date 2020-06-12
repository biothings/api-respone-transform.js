const json_transform = require("@biothings-explorer/json-transformer");

module.exports = class BaseTransformer {

    constructor(data) {
        this.data = data;
        this.edge = data.edge;
    }

    /**
     * Create an object with key representing input, and value representing the output of API
     */
    pairInputWithAPIResponse = () => {
        return {
            [this.edge.input]: [this.data.response]
        }
    }

    /**
     * Wrapper functions to transform API response before passing to JSON Transformer
     * @return {Object} - key is curie representing input, value is an array of outputs.
     */
    wrap = (res) => {
        if (Array.isArray(res)) {
            res = { data: res }
        }
        return res;
    }

    /**
     * Transform Individual JSON response into Biolink compatible format
     * @param {Object} res - JSON response representing an output.
     */
    jsonTransform = (res) => {
        res = json_transform(res, this.edge.response_mapping);
        return res;
    }

    /**
     * Add edge information into individual output JSON.
     * @param {Object} res - JSON response representing an output.
     */
    addEdgeInfo = (input, res) => {
        if (res === undefined || Object.keys(res).length === 0) {
            return [];
        }
        let output_ids = this.extractOutputIDs(res);
        let result = output_ids.map(item => {
            res = {
                ...res,
                ...{
                    $association: this.edge.association,
                    $input: input,
                    $output: item
                }
            }
            return res;
        });
        return result;
    }

    /**
     * Main function to transform API response
     */
    transform = () => {
        let result = [];
        let responses = this.pairInputWithAPIResponse();
        for (let curie of Object.keys(responses)) {
            if (Array.isArray(responses[curie]) && responses[curie].length > 0) {
                responses[curie].map(item => {
                    item = this.wrap(item);
                    item = this.jsonTransform(item);
                    for (let predicate of Object.keys(item)) {
                        if (Array.isArray(item[predicate]) && item[predicate].length > 0) {
                            item[predicate].map(rec => {
                                rec = this.addEdgeInfo(curie, rec);
                                result = [...result, ...rec];
                            });
                        } else {
                            result = [...result, ...this.addEdgeInfo(item[predicate])];
                        }
                    }
                });
            }
        };
        return result;
    }
    /**
     * Retrieve all output IDs.
     * @param {Object} res - JSON response representing an output.
     */
    extractOutputIDs = (res) => {
        let output_id_type = this.edge.association.output_id;
        if (!(output_id_type in res)) {
            return [];
        } else {
            if (Array.isArray(res[output_id_type])) {
                return res[output_id_type]
            } else {
                return [res[output_id_type]]
            }
        }
    }
}