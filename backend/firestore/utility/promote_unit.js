const { doc, updateDoc, getDoc, getDocs, collection, increment } = require("firebase/firestore")
const { db } = require("../../firebase-config");

const promoteUnit = async (user, unitID, promoType, party, promoCost) => {
    const userRef = doc(db, 'users', user.id);
    const unitsCollRef = collection(db, 'units');
    const unitsCollSnap = await getDocs(unitsCollRef);

    let unitData = {};

    unitsCollSnap.forEach(doc => {
        Object.keys(doc.data()).forEach(unitType => {
            if (unitType === promoType) {
                unitData = doc.data()[promoType];
                unitData.type = unitType;
                unitData.exp = 0;
                unitData.class = doc.id;
                unitData.UID = unitID;
            }
        })
    })

    const units = party;

    units[unitID] = unitData;

    // allows admin/free promotions if promoCost is undefined or less than 1
    if(promoCost > 0) {
        updateDoc(userRef, {
            party: units,
            'stats.gold': increment(-promoCost)
        })
    }
    else {
        updateDoc(userRef, {
            party: units
        })
    }

    return true;
}

module.exports = { promoteUnit };