exports.generateCurie = (idType, id) => {
    if (id.includes(':')) {
        id = id.split(':').slice(-1)[0];
    }
    return idType + ':' + id;
}