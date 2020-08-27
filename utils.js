exports.generateCurie = (idType, id) => {
    if (Array.isArray(id)) {
        id = id[0];
    }
    if (id.includes(':')) {
        id = id.split(':').slice(-1)[0];
    }
    return idType + ':' + id;
}