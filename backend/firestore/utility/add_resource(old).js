const { collection, getDocs, doc, getDoc, updateDoc, increment } = require("firebase/firestore");
const { db } = require("../../firebase-config");

const addResource = async (id, userID) => {
    // res is short for resources
    const resRef = collection(db, 'resources');
    const resSnap = await getDocs(resRef);
    let resFound = false;
    let resData;

    resSnap.forEach((doc) => {
        const docRes = Object.keys(doc.data());
        docRes.forEach(res => {
            if(res === id) {
                resFound = res;
                resData = doc.data()[resFound];
            }
        })
    })

    if(!resFound) return false;

    resData.amt = 1;
    delete resData.explore;

    const userRef = doc(db, 'users', userID);
    const userSnap = await getDoc(userRef);
    let hasRes = false;

    if(Object.keys(userSnap.data().backpack).includes(resFound)) {
        hasRes = true;
    }

    if(hasRes) {
        await updateDoc(userRef, {
            [`backpack.${resFound}.amt`]: increment(1)
        })
    }
    else {
        await updateDoc(userRef, {
            [`backpack.${resFound}`]: resData
        })
    }

    return true;
}

module.exports = { addResource };