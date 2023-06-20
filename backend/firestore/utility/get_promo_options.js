const { doc, collection, getDocs } = require("firebase/firestore")
const { db } = require("../../firebase-config")

const getPromoOptions = async (unitData, party) => {
    console.log('getPromoOptions')
    console.log(unitData)
    const unitsCollRef = collection(db, 'units');
    const unitsSnap = await getDocs(unitsCollRef);

    const unitID = Object.keys(unitData)[0];
    unitData = unitData[Object.keys(unitData)[0]];
    unitData.id = unitID;

    const promoClasses = unitData.otherData.promote;
    console.log(promoClasses);
    let promoRank = unitData.otherData.rank + 1;
    const promoOptions = [];

    unitsSnap.forEach(doc => {
        if (promoClasses.includes(doc.id)) {
            console.log(doc.id);
            Object.keys(doc.data()).forEach(type => {
                if (doc.data()[type].rank === promoRank) {
                    const option = doc.data()[type];
                    option.id = type;
                    promoOptions.push(option);
                }
            })
        }
    })

    const promoData = {
        promoOptions: promoOptions,
        promoAmt: party.shortListWithPromos('object'),
        unitType: unitData.id
    }

    return promoData;
}

module.exports = { getPromoOptions };