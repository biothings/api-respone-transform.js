import BiolinkTransformer from "./transformers/biolink_transformer";
import BioThingsTransformer from "./transformers/biothings_transformer";
import CordTransformer from "./transformers/cord_transformer";
import CTDTransformer from "./transformers/ctd_transformer";
import SemmedTransformer from "./transformers/semmed_transformer";
import OpenTargetTransformer from "./transformers/opentarget_transformer";
import BaseTransformer from "./transformers/transformer";
import { BTEQueryObject } from "./types";
const debug = require("debug")("api-response-transform:index");

export class Transformer {
    private data: BTEQueryObject;
    private tf: BaseTransformer;
    constructor(data: BTEQueryObject) {
        this.data = data;
        this.route();
    }

    route() {
        let api = this.data.edge.association.api_name;
        debug(`api name ${api}`);
        let tags = this.data.edge.query_operation.tags;
        debug(`api tags: ${tags}`);
        if (api.startsWith('CORD')) {
            this.tf = new CordTransformer(this.data);
        } else if (api.startsWith('SEMMED')) {
            this.tf = new SemmedTransformer(this.data);
        } else if (api === 'BioLink API') {
            this.tf = new BiolinkTransformer(this.data);
        } else if (tags.includes("biothings")) {
            this.tf = new BioThingsTransformer(this.data);
        } else if (tags.includes("ctd")) {
            this.tf = new CTDTransformer(this.data);
        } else if (tags.includes("opentarget")) {
            this.tf = new OpenTargetTransformer(this.data)
        } else {
            this.tf = new BaseTransformer(this.data)
        }
    }

    transform() {
        return this.tf.transform();
    }
}