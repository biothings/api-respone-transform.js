import crypto from "crypto";

export interface FrozenRecord {
  subject: FrozenNode;
  object: FrozenNode;
  predicate?: string; // not required if given apiEdge, qXEdge
  publications?: string[]; // not required if given apiEdge, qXEdge
  recordHash?: string; // always supplied by Record, not required from user
  api?: string; // not required if given apiEdge, qXEdge
  apiInforesCurie?: string; // not required if given apiEdge, qXEdge
  metaEdgeSource?: string; // not required if given apiEdge, qXEdge
  mappedResponse?: MappedResponse;
}

export interface VerboseFrozenRecord {
  subject: VerboseFrozenNode;
  object: VerboseFrozenNode;
  association: Association;
  predicate?: string; // not required if given apiEdge, qXEdge
  publications?: string[]; // not required if given apiEdge, qXEdge
  recordHash?: string; // always supplied by Record, not required from user
  api?: string; // not required if given apiEdge, qXEdge
  apiInforesCurie?: string; // not required if given apiEdge, qXEdge
  metaEdgeSource?: string; // not required if given apiEdge, qXEdge
  mappedResponse?: MappedResponse;
}

// removes all computed values on assumption that apiEdge and qXEdge are saved elsewhere
interface MinimalFrozenRecord {
  subject: VerboseFrozenNode | MinimalFrozenNode;
  object: VerboseFrozenNode | MinimalFrozenNode;
  publications?: string[]; // not always present
  mappedResponse?: MappedResponse;
  [additionalProperties: string]: any;
}

interface FrozenNode {
  // less verbose, loses extra information from nodeNormalizer
  original: string;
  qNodeID: string;
  isSet: boolean;
  curie: string;
  UMLS: string;
  semanticType: string;
  label: string;
  attributes: any;
  [additionalProperties: string]: any; // cleanest way to handler undefined properties
}

interface VerboseFrozenNode {
  original: string;
  normalizedInfo?: NodeNormalizerResultObj[]; // always supplied by Record, not required from user
  qNodeID: string;
  isSet: boolean;
  curie: string;
  UMLS: string;
  semanticType: string;
  label: string;
  equivalentCuries?: string[]; // always supplied by Record, not required from user
  names: string[];
  attributes: any;
}

interface MinimalFrozenNode {
  original: string;
  normalizedInfo?: NodeNormalizerResultObj[]; // always supplied by Record, not required from user
  [additionalProperties: string]: any; // cleanest way to handler undefined properties
}

type RecordPackage = [apiEdges: any[], ...frozenRecords: FrozenRecord[]];

interface MappedResponse {
  "edge-attributes"?: EdgeAttribute[];
  [mappedItems: string]: any;
}

interface Association {
  input_id?: string;
  input_type?: string;
  output_id?: string;
  output_type?: string;
  predicate: string;
  source?: string;
  api_name?: string;
  "x-translator"?: any;
  // [additionalProperties: string]: any;
}

interface QXEdge {
  getSubject(): QNode;
  getObject(): QNode;
  getHashedEdgeRepresentation(): string;
  isReversed(): boolean;
  [additionalProperties: string]: any;
}

interface QNode {
  getID(): string;
  isSet(): boolean;
  [additionalProperties: string]: any;
}

interface EdgeAttribute {
  attribute_source: string;
  attribute_type_id: string;
  value: any;
  value_type_id: string;
  attributes?: EdgeAttribute[];
  [additionalProperties: string]: any;
}

interface Identifier {
  identifier: string;
  label?: string;
}

interface NodeNormalizerResultObj {
  id?: Identifier;
  equivalent_identifiers?: Identifier[];
  type?: string[];
  information_content?: number;
  primaryID?: string;
  label?: string;
  attributes?: any;
  semanticType?: string;
  _leafSemanticType?: string;
  semanticTypes?: string[];
  curies?: string[];
  dbIDs?: any;
  _dbIDs?: any;
  [additionalProperties: string]: any;
}

function hash(string: string) {
  return crypto.createHash("md5").update(string).digest("hex");
}

class RecordNode {
  original: string;
  normalizedInfo: NodeNormalizerResultObj[];
  _qNode: QNode;

  constructor(node: FrozenNode | VerboseFrozenNode | MinimalFrozenNode, qNode: QNode) {
    this.original = node.original;
    this.normalizedInfo = node.normalizedInfo ? node.normalizedInfo : this.makeFakeInfo(node);
    this._qNode = qNode;
  }

  makeFakeInfo(node: FrozenNode | VerboseFrozenNode | MinimalFrozenNode): NodeNormalizerResultObj[] {
    return [
      {
        id: {
          identifier: node.curie,
          label: node.label,
        },
        equivalent_identifiers: node.equivalentCuries?.map((curie: string): Identifier => {
          return { identifier: curie };
        }),
        type: [node.semanticType],
        primaryID: node.curie,
        dbIDs: {
          UMLS: node.UMLS,
          name: node.names,
        },
        semanticType: node.semanticType,
        label: node.label,
        curies: node.equivalentCuries || [node.curie],
        attributes: node.attributes,
        semanticTypes: [node.semanticType],
      },
    ];
  }

  toJSON(): VerboseFrozenNode {
    return {
      original: this.original,
      normalizedInfo: this.normalizedInfo,
      qNodeID: this.qNodeID,
      isSet: this.isSet,
      curie: this.curie,
      UMLS: this.UMLS,
      semanticType: this.semanticType,
      label: this.label,
      equivalentCuries: this.equivalentCuries,
      names: this.names,
      attributes: this.attributes,
    };
  }

  freeze(): FrozenNode {
    const node = this.toJSON() as FrozenNode;
    delete node.normalizedInfo;
    delete node.equivalentCuries;
    delete node.names;
    return node;
  }

  freezeVerbose(): VerboseFrozenNode {
    return this.toJSON();
  }

  freezeMinimal(): MinimalFrozenNode {
    return {
      original: this.original,
      normalizedInfo: this.normalizedInfo,
    };
  }

  get qNodeID(): string {
    return this._qNode.getID();
  }

  get isSet(): boolean {
    return this._qNode.isSet();
  }

  get curie(): string {
    return this.normalizedInfo?.[0].primaryID;
  }

  get UMLS(): string {
    return this.normalizedInfo?.[0].dbIDs?.UMLS;
  }

  get semanticType(): string {
    return this.normalizedInfo?.[0].semanticType;
  }

  get label(): string {
    return this.normalizedInfo?.[0].label;
  }

  get equivalentCuries(): string[] {
    return this.normalizedInfo?.[0].curies;
  }

  get names(): string[] {
    return this.normalizedInfo?.[0].dbIDs.name;
  }

  get attributes(): any {
    return this.normalizedInfo?.[0].attributes;
  }
}

export class Record {
  association: Association;
  qXEdge: QXEdge;
  config: any;
  subject: RecordNode;
  object: RecordNode;
  mappedResponse: MappedResponse;

  constructor(
    record: FrozenRecord | VerboseFrozenRecord | MinimalFrozenRecord,
    config?: any,
    apiEdge?: Association,
    qXEdge?: QXEdge,
    reverse?: boolean,
  ) {
    this.association = apiEdge ? apiEdge : this.makeAPIEdge(record);
    this.qXEdge = qXEdge ? qXEdge : this.makeFakeQXEdge(record);
    this.config = config ? config : { EDGE_ATTRIBUTES_USED_IN_RECORD_HASH: [] };
    if (!reverse) {
      this.subject = new RecordNode(record.subject, this.qXEdge.getSubject());
      this.object = new RecordNode(record.object, this.qXEdge.getObject());
    } else {
      this.subject = new RecordNode(record.subject, this.qXEdge.getObject());
      this.object = new RecordNode(record.object, this.qXEdge.getSubject());
    }
    this.mappedResponse = record.mappedResponse ? record.mappedResponse : {};
    if (!this.mappedResponse.publications) {
      this.mappedResponse.publications = record.publications;
    }
  }

  queryDirection() {
    if (!this.qXEdge.isReversed()) {
      return this;
    } else {
      const frozen = { ...this.freezeVerbose() };
      const reversedAPIEdge: any = { ...frozen.association };
      reversedAPIEdge.input_id = frozen.association.output_id;
      reversedAPIEdge.input_type = frozen.association.output_type;
      reversedAPIEdge.output_id = frozen.association.input_id;
      reversedAPIEdge.output_type = frozen.association.input_type;
      const predicate = this.qXEdge.getReversedPredicate(frozen.association.predicate);
      reversedAPIEdge.predicate = predicate;
      // frozen.predicate = 'biolink:' + predicate;
      frozen.association = reversedAPIEdge;
      let temp = frozen.subject;
      frozen.subject = frozen.object;
      frozen.object = temp;
      return new Record(frozen, this.config, frozen.association, this.qXEdge, true);
    }
  }

  // for user-made records lacking qXEdge
  protected makeFakeQXEdge(record: FrozenRecord | VerboseFrozenRecord | MinimalFrozenRecord): QXEdge {
    return {
      getSubject(): QNode {
        return {
          getID(): string {
            return record.subject.qNodeID;
          },
          isSet(): boolean {
            return record.subject.isSet || false;
          },
        };
      },
      getObject(): QNode {
        return {
          getID(): string {
            return record.object.qNodeID;
          },
          isSet(): boolean {
            return record.object.isSet || false;
          },
        };
      },
      isReversed(): boolean {
        return false;
      },
      // WARNING not useable alongside actual QXEdge.getHashedEdgeRepresentation
      // However the two should never show up together as this is only for testing purposes
      getHashedEdgeRepresentation(): string {
        return hash(
          record.subject.semanticType +
            record.predicate +
            record.object.semanticType +
            (record.subject.equivalentCuries || record.object.equivalentCuries),
        );
      },
    };
  }

  protected makeAPIEdge(record: FrozenRecord | VerboseFrozenRecord | MinimalFrozenRecord): Association {
    return {
      predicate: record.predicate?.replace("biolink:", ""),
      api_name: record.api,
      source: record.metaEdgeSource,
      "x-translator": {
        infores: record.apiInforesCurie,
      },
    };
  }

  public static freezeRecords(records: Record[]): FrozenRecord[] {
    return records.map((record: Record): FrozenRecord => record.freeze());
  }

  public static unfreezeRecords(records: FrozenRecord[], config?: any): Record[] {
    return records.map((record: FrozenRecord): Record => new Record(record, config));
  }

  public static packRecords(records: Record[]): RecordPackage {
    // save string space by storing apiEdge and recordNode .normalizedInfo's separately (eliminates duplicates)
    const frozenRecords = [];
    const apiEdgeHashes = [];
    const apiEdges = [];
    records.forEach((record: Record, i: number) => {
      const frozenRecord = record.freezeMinimal();

      const apiEdgeHash = hash(JSON.stringify(record.association));

      let apiEdgeHashIndex = apiEdgeHashes.findIndex(hash => hash === apiEdgeHash);

      if (apiEdgeHashIndex === -1) {
        apiEdgeHashes.push(apiEdgeHash);
        apiEdges.push(record.association);
        apiEdgeHashIndex = apiEdgeHashes.length - 1;
      }

      frozenRecords.push({
        ...frozenRecord,
        apiEdge: apiEdgeHashIndex,
      });
    });

    return [apiEdges, ...frozenRecords];
  }

  public static unpackRecords(recordPack: RecordPackage, qXEdge: QXEdge, config?: any): Record[] {
    const [apiEdges, ...frozenRecords] = recordPack;
    return frozenRecords.map((record: any): Record => {
      const apiEdge = apiEdges[record.apiEdge];
      return new Record(record, config, apiEdge, qXEdge);
    });
  }

  toJSON(): VerboseFrozenRecord {
    return {
      subject: this.subject.freezeVerbose(),
      object: this.object.freezeVerbose(),
      association: this.association,
      predicate: this.predicate,
      publications: this.publications,
      recordHash: this.recordHash,
      api: this.api,
      apiInforesCurie: this.apiInforesCurie,
      metaEdgeSource: this.metaEdgeSource,
      mappedResponse: this.mappedResponse,
    };
  }

  freeze(): FrozenRecord {
    const record = this.toJSON() as FrozenRecord;
    record.subject = this.subject.freeze();
    record.object = this.object.freeze();
    //@ts-ignore
    delete record.association;
    record.mappedResponse = {
      ...record.mappedResponse,
      publications: undefined,
    };
    return record;
  }

  freezeVerbose(): VerboseFrozenRecord {
    return this.toJSON();
  }

  freezeMinimal(): MinimalFrozenRecord {
    return {
      subject: this.subject.freezeMinimal(),
      object: this.object.freezeMinimal(),
      publications: this.publications,
      mappedResponse: this.mappedResponse,
    };
  }

  protected _getFlattenedEdgeAttributes(attributes: EdgeAttribute[]): EdgeAttribute[] {
    return attributes
      ? attributes.reduce((arr: EdgeAttribute[], attribute: EdgeAttribute) => {
          attribute.attributes
            ? arr.push(attribute, ...this._getFlattenedEdgeAttributes(attribute.attributes))
            : arr.push(attribute);
          return arr;
        }, [])
      : [];
  }

  protected get _configuredEdgeAttributesForHash(): string {
    return this._getFlattenedEdgeAttributes(this.mappedResponse["edge-attributes"])
      .filter(attribute => {
        return this.config.EDGE_ATTRIBUTES_USED_IN_RECORD_HASH.includes(attribute.attribute_type_id);
      })
      .reduce((acc, attribute) => {
        return [...acc, `${attribute.attribute_type_id}:${attribute.value}`];
      }, [])
      .join(",");
  }

  protected get _recordHashContent(): string {
    return [
      this.subject.curie,
      this.predicate,
      this.object.curie,
      this.api,
      this.metaEdgeSource,
      this._configuredEdgeAttributesForHash,
    ].join("-");
  }

  get recordHash(): string {
    return hash(this._recordHashContent);
  }

  get predicate(): string {
    return "biolink:" + this.association.predicate;
  }

  get api(): string {
    return this.association.api_name;
  }

  get apiInforesCurie(): string {
    if (this.association["x-translator"]) {
      return this.association["x-translator"]["infores"] || undefined;
    }
    return undefined;
  }

  get metaEdgeSource(): string {
    return this.association.source;
  }

  get publications(): string[] {
    return this.mappedResponse.publications;
  }
}
