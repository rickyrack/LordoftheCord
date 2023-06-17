const { doc, getDoc } = require("firebase/firestore");
const { getTile } = require("../../../bot/helper/locations/get_tile");
const { db } = require("../../firebase-config");
const { addItem } = require("../utility/add_item");
const { updateMorale } = require("../utility/update_morale");

const explore = async (userData, user) => {
    const tile = getTile(userData);

    const tileRef = doc(db, 'tiles', tile.type);
    const tileSnap = await getDoc(tileRef);

    const availItems = [];

    Object.keys(tileSnap.data().items).forEach(item => {
        for (let i = 0; i < tileSnap.data().items[item].chance; i++) {
            availItems.push(item);
        }
    });

    /*let partySize = 1; // accounts for self
    Object.values(userData.party).forEach(unitAmt => {
        partySize += unitAmt;
    })*/

    //const multiplier = userData.stats.party.exploration * Math.ceil(partySize/50);
    let multiplier = Math.ceil(Math.random() * (userData.stats.party.spotting * 5)) + 1;
    console.log(multiplier);

    let items = [];

    for (let i = 0; i < multiplier; i++) {
        items.push(availItems[Math.floor(Math.random() * availItems.length)]);
    }

    if(!await updateMorale(user, 'explore', 1, userData)) return false;

    for (let i = 0; i < items.length; i++) {
        await addItem(user, items[i]);
    }

    return items;
}

module.exports = { explore };