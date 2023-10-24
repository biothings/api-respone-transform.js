# only take comments where dbReferences type is Rhea
.comments = [
  select(.comments != null) | .comments | .[] | select(.reaction != null) | .reaction.dbReferences = [.reaction.dbReferences | .[] | select(.type == "Rhea")]
]
