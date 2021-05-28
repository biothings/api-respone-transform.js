import BaseTransformer from "./transformer";

export default class TRAPITransformer extends BaseTransformer {
    _getUniqueEdges() {
        const edges = {};
        if ('message' in this.data.response && 'results' in this.data.response.message && Array.isArray(this.data.response.message.results)) {
            this.data.response.message.results.map(item => {
                edges[item.edge_bindings.e01[0].id] = {
                    subject: item.node_bindings.n0[0].id,
                    object: item.node_bindings.n1[0].id
                }
            });
        }
        return edges;
    }

    _getEdgeInfo(edgeID) {
        if ('message' in this.data.response && 'knowledge_graph' in this.data.response.message && 'edges' in this.data.response.message.knowledge_graph) {
            return this.data.response.message.knowledge_graph.edges[edgeID];
        }
        return undefined;
    }

    _transformIndividualEdge(edge, edgeBinding) {
        let res = {
            "$output": {
                original: edgeBinding.object
            }
        };
        if ("attributes" in edge && Array.isArray(edge.attributes)) {
            for (const attr of edge.attributes) {
                if ('name' in attr && 'value' in attr) {
                    if (!['subject', 'object'].includes(attr.name)) {
                        res[attr.name] = attr.value;
                    }

                }
            }
        }
        res = this._updateEdgeMetadata(res);
        res = this._updateInput(res, edgeBinding.subject);
        if ("$input" in res && "obj" in res["$input"] && !(typeof res["$input"]["obj"] === "undefined")) {
            return res;
        }

    }

    transform() {
        const edgeBindings = this._getUniqueEdges();
        return Object.keys(edgeBindings).map(edge => {
            const edgeInfo = this._getEdgeInfo(edge);
            if (!(typeof edgeInfo === "undefined")) {
                return this._transformIndividualEdge(edgeInfo, edgeBindings[edge]);
            }
        })
    }
}