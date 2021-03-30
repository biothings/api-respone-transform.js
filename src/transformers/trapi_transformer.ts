import BaseTransformer from "./transformer";

export default class TRAPITransformer extends BaseTransformer {
    _getUniqueEdges() {
        if ('message' in this.data.response && 'results' in this.data.response.message && Array.isArray(this.data.response.message.results)) {
            const edges = this.data.response.message.results.map(item => item.edge_bindings.e01[0].id);
            return Array.from(new Set(edges));
        }
        return [];
    }

    _getEdgeInfo(edgeID) {
        if ('message' in this.data.response && 'knowledge_graph' in this.data.response.message && 'edges' in this.data.response.message.knowledge_graph) {
            return this.data.response.message.knowledge_graph.edges[edgeID];
        }
        return undefined;
    }

    _transformIndividualEdge(edge) {
        let res = {
            "$output": {
                original: edge.object
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
        res = this._updateInput(res, edge.subject);
        return res;
    }

    transform() {
        const edgeIDs = this._getUniqueEdges();
        return edgeIDs.map(edge => {
            const edgeInfo = this._getEdgeInfo(edge);
            if (!(typeof edgeInfo === "undefined")) {
                return this._transformIndividualEdge(edgeInfo);
            }
        })
    }
}