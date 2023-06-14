const { doc, getDoc, getDocs, updateDoc, collection } = require("firebase/firestore");
const { db } = require("../../firebase-config");

const addUnits = async (user, unitID, amount, userData) => {
    const userRef = doc(db, 'users', user.id);

    // userData is optional and will make function faster if provided
    if(!userData) {
        const userSnap = await getDoc(userRef);
        userData = userSnap.data();
    }

    const unitsCollRef = collection(db, 'units');
    const unitsCollSnap = await getDocs(unitsCollRef);

    let unitData = {};
    unitsCollSnap.forEach(doc => {
        Object.keys(doc.data()).forEach(unit => {
            if (unit === unitID) {
                unitData[unit] = doc.data()[unit];
                unitData[unit].type = doc.id;
                unitData[unit].exp = 0;
            }
        })
    })

    if (Object.keys(unitData).length === 0) return false;

    const units = userData.party;

    for (let i = 0; i < amount; i++) {
        units[Date.now() + Math.floor(Math.random() * 100000)] = unitData;
    }

    updateDoc(userRef, {
        party: units
    })

    return true;
}

module.exports = { addUnits };