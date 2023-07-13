const { collection, getDocs } = require("firebase/firestore")
const { db } = require("../../firebase-config")

const getPromos = async (typeData) => {
    const unitsColl = collection(db, 'units');
    const unitsSnap = await getDocs(unitsColl);
    let optionsData = [];
    unitsSnap.forEach(doc => {
        typeData.promote.forEach(typeClass => {
            if(doc.id === typeClass) {
                Object.keys(doc.data()).forEach(unitType => {
                    const data = doc.data()[unitType];
                    if(data.rank === typeData.rank + 1) {
                        data.id = unitType;
                        optionsData.push(data);
                    }
                })
            }
        })
    })

    return optionsData;
}

module.exports = { getPromos };