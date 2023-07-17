const { doc, updateDoc } = require("firebase/firestore")
const { db } = require("../../firebase-config")

const dismissUnits = async (user, unitType, amt, party) => {
    const userRef = doc(db, 'users', user.id);
    
    const units = party;
    const unitTypeArray = [];

    Object.keys(units).forEach(unitID => {
        if(units[unitID].type === unitType) {
            unitTypeArray.push(unitID);
        }
    })

    for (let i = 0; i < amt; i++) {
        delete units[unitTypeArray[unitTypeArray.length - 1]];
        const testing = unitTypeArray.pop();
    }

    await updateDoc(userRef, {
        party: units
    })

    return true;
}

module.exports = { dismissUnits };