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
    addEdgeInfo = (res) => {
        res = {
            ...res,
            ...{
                association: this.edge.association
            }
        };
        return res
    }

    /**
     * Main function to transform API response
     */
    transform = () => {
        let result = {}
        let responses = this.pairInputWithAPIResponse();
        for (let curie of Object.keys(responses)) {
            if (Array.isArray(responses[curie]) && responses[curie].length > 0) {
                result[curie] = responses[curie].map(item => {
                    item = this.wrap(item);
                    item = this.jsonTransform(item);
                    for (let predicate of Object.keys(item)) {
                        if (Array.isArray(item[predicate]) && item[predicate].length > 0) {
                            item[predicate] = item[predicate].map(rec => this.addEdgeInfo(rec));
                        } else {
                            item[predicate] = [this.addEdgeInfo(item[predicate])];
                        }
                    }
                    return item;
                });

            }
        };
        return result;
    }
    /**
     * Retrieve all output IDs.
     */
    extractOutputIDs = () => {

    }
}