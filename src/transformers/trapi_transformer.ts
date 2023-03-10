import BaseTransformer from "./transformer";
import { Record } from "../record";

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
        let frozenRecord = {
          subject: this._getSubject(edgeBinding.subject),
          object: {
            original: edgeBinding.object,
          },
          qualifiers: edge.qualifiers
            ? Object.fromEntries(
                edge.qualifiers.map(qualifier => {
                  return [qualifier.qualifier_type_id, qualifier.qualifier_value];
                }),
              )
            : undefined,
          association: this.edge.association,
          qEdge: this.edge.reasoner_edge,
          mappedResponse: { "edge-attributes": [...edge.attributes] },
        };

        if ("subject" in frozenRecord) {
            return new Record(frozenRecord, this.config, this.edge.association, this.edge.reasoner_edge);
        }

    }

    async transform() {
        const edgeBindings = this._getUniqueEdges();
        return Object.keys(edgeBindings).map(edge => {
            const edgeInfo = this._getEdgeInfo(edge);
            if (!(typeof edgeInfo === "undefined")) {
                return this._transformIndividualEdge(edgeInfo, edgeBindings[edge]);
            }
        })
    }
}
