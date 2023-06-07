const { doc, getDoc, query, getDocs, updateDoc } = require("firebase/firestore");
const { db } = require("../../firebase-config");

const addUnit = async (user, unitID, userData, amount) => {
    const userRef = doc(db, 'users', user.id);

    // userData is optional and will make function faster if provided
    if(!userData) {
        const userSnap = await getDoc(userRef);
        userData = userSnap.data();
    }

    const unitsCollRef = doc(db, 'units');
    const unitsCollSnap = await getDocs(unitsCollRef);

    const unitData = null;
    unitsCollSnap.forEach(doc => {
        Object.keys(doc.data()).forEach(unit => {
            if (unit === unitID) {
                unitData = doc.data()[unit];
                unitData.type = doc.id;
            }
        })
    })

    if (!unitData) return false;

    if(amount)
    updateDoc(userRef, {
        party
    })
}

module.exports = { addUnit };