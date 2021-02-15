exports.generateCurie = (idType, id) => {
    if (Array.isArray(id)) {
        id = id[0];
    }
    if (typeof id === "string" && id.includes(':')) {
        id = id.split(':').slice(-1)[0];
    }
    return idType + ':' + id;
}

exports.toArray = (item) => {
    if (!(Array.isArray(item))) {
        return [item];
    }
    return item;
}