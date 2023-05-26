const getTile = (userData) => {
    const mapData = require('../../map/map.json').map;

    let tile;
    mapData.forEach(column => {
        column.forEach(mapTile => {
            if(mapTile.coords[0] === userData.coords.x
            && mapTile.coords[1] === userData.coords.y) {
                tile = mapTile;
            }
        })
    
    })

    return tile;
}

module.exports = { getTile };