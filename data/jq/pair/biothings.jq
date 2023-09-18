if $edge.query_operation.method == "post" then
  # if response is not an array, then use response.hits
  if (.response | type) == "array" then .response else .response.hits end |
  reduce .[] as $item ({};
    # if the item is notfound, then proceed to next item & keep current object
    if ($item | keys | contains(["notfound"])) then
      .
    else
      if $edge.input | type == "object" and $edge.input.queryInputs | type == "object" then
        generateCurieWithInputs($edge.association.input_id; $item.query; $edge.input.queryInputs) as $curie | .[$curie] = .[$curie] + [$item]
      else
        generateCurie($edge.association.input_id; $item.query) as $curie | .[$curie] = .[$curie] + [$item]
      end
    end
  )
else
  if ($edge.input | type) == "object" then
    .response as $res | generateCurie($edge.association.input_id; $edge.input.queryInputs) as $curie | {} | .[$curie] = [$res]
  else
    .response as $res | generateCurie($edge.association.input_id; $edge.input) as $curie | {} | .[$curie] = [$res]
  end
end
