const biolink_tf = require("./transformers/biolink_transformer");
const semmed_tf = require("./transformers/semmed_transformer");
const cord_tf = require("./transformers/cord_transformer");
const ctd_tf = require("./transformers/ctd_transformer");
const opentarget_tf = require("./transformers/opentarget_transformer");
const biothings_tf = require("./transformers/biothings_transformer");
const base_tf = require("./transformers/transformer");
const debug = require("debug")("api-response-transform:index");

module.exports = class Transformer {
    constructor(data) {
        this.data = data;
        this.route();
    }

    route() {
        let api = this.data.edge.association.api_name;
        debug(`api name ${api}`);
        let tags = this.data.edge.query_operation.tags;
        debug(`api tags: ${tags}`);
        if (api.startsWith('CORD')) {
            this.tf = new cord_tf(this.data);
        } else if (api.startsWith('SEMMED')) {
            this.tf = new semmed_tf(this.data);
        } else if (api === 'BioLink API') {
            this.tf = new biolink_tf(this.data);
        } else if (tags.includes("biothings")) {
            this.tf = new biothings_tf(this.data);
        } else if (tags.includes("ctd")) {
            this.tf = new ctd_tf(this.data);
        } else if (tags.includes("opentarget")) {
            this.tf = new opentarget_tf(this.data)
        } else {
            this.tf = new base_tf(this.data)
        }
    }

    transform() {
        return this.tf.transform();
    }
}