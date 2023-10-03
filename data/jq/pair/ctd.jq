reduce (.response | .[]) as $item (
  {}; .[generateCurie($edge.association.input_id; (
    if ($edge.input | type) == "object" then
      ($edge.input.queryInputs | toArray)[] | select(($item.Input | ascii_upcase) | contains(. | ascii_upcase))
    else
      ($edge.input | toArray) | select(($item.Input | ascii_upcase) | contains(. | ascii_upcase))
    end
  ))] = [] 
  + .[generateCurie($edge.association.input_id; (
    if ($edge.input | type) == "object" then
    ($edge.input.queryInputs | toArray)[] | select(($item.Input | ascii_upcase) | contains(. | ascii_upcase))
    else
    ($edge.input | toArray) | select(($item.Input | ascii_upcase) | contains(. | ascii_upcase))
    end
  ))] 
  + [$item]
) | map_values([.])
# TODO: current setup doesn't error, but only grabs one item.
