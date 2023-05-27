const { doc, getDoc } = require("firebase/firestore");
const { getTile } = require("../utility/get_tile");
const { db } = require("../../firebase-config");
const { addItem } = require("../utility/add_item");

const explore = async (userData, user) => {
    const tile = getTile(userData);

    const tileRef = doc(db, 'tiles', tile.type)
    const tileSnap = await getDoc(tileRef);

    const availItems = [];

    Object.keys(tileSnap.data().items).forEach(item => {
        for (let i = 0; i < tileSnap.data().items[item]; i++) {
            availItems.push(item);
        }
    });

    let partySize = 1;
    Object.values(userData.party).forEach(unitAmt => {
        partySize += unitAmt;
    })
    
    const multiplier = userData.stats.party.exploration * Math.ceil(partySize/50);

    let items = [];

    for (let i = 0; i < multiplier; i++) {
        console.log('test');
        items.push(availItems[Math.floor(Math.random() * availItems.length)]);
    }

    await addItem(user, 'Mushroom');
    console.log('BREAK');
    console.log(availItems);
    console.log(items);
}

module.exports = { explore };