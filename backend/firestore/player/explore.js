const { doc, getDoc } = require("firebase/firestore");
const { getTile } = require("../utility/get_tile");
const { db } = require("../../firebase-config");

const explore = async (userData) => {
    const tile = getTile(userData);

    const tileRef = doc(db, 'tiles', tile.type)
    const tileSnap = await getDoc(tileRef);

    const items = [];

    Object.keys(tileSnap.data().items).forEach(item => {
        for (let i = 0; i < tileSnap.data().item; i++) {
            items.push(item);
        }
    })

    console.log(items);
}

module.exports = { explore };