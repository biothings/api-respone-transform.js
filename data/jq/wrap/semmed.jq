# finds start/end index of sub in main string
# ie. "ab" in "12abcd" will return "2|3"
def index_text(main; sub): (main|index(sub)|tostring)+"|"+((main|index(sub)) + (sub|length) | tostring);


.["edge-attributes"] = [.predication | group_by(.pmid) | .[] | .[0] |
# create edge attributes for each publication
{
  "attribute_source": "infores:text-mining-provider-targeted",
  "attribute_type_id": "biolink:has_supporting_study_result",
  "attributes": [
    {
      "attribute_type_id": "biolink:supporting_text",
      "value": .sentence,
    },
    {
      "attribute_type_id": "biolink:publications",
      "value": ( "PMID:"+(.pmid|tostring) ),
    }
      {
        "attribute_type_id": "biolink:subject_location_in_text",
        "value": ( .subject_text as $text | index_text(.sentence; $text) ),
      },
      {
        "attribute_type_id": "biolink:object_location_in_text",
        "value": ( .object_text as $text | index_text(.sentence; $text) ),
      }
  ],
  "value": ( .predication_id | tostring ),
}]
