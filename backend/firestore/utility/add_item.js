const { doc, getDocs, collection, updateDoc, increment, getDoc } = require("firebase/firestore")
const { db } = require("../../firebase-config")

const addItem = async (user, itemID, userData) => {
    const userRef = doc(db, 'users', user.id);

    // userData is optional and will make function faster if provided
    if(!userData) {
        const userSnap = await getDoc(userRef);
        userData = userSnap.data();
    }

    const itemsColl = collection(db, 'items');
    const itemsSnap = await getDocs(itemsColl);

    let itemData = {
        id: '',
        data: {}
    }

    itemsSnap.forEach(doc => {
        Object.keys(doc.data()).forEach(item => {
            if(item === itemID) {
                itemData.id = item;
                itemData.data = doc.data()[item];
            }
        })
    })

    if(userData.gear?.[itemData.id]?.quantity > 0) {
        await updateDoc(userRef, {
            [`gear.${itemData.id}.quantity`]: increment(1)
        })
    }
    else {
        await updateDoc(userRef, {
            [`gear.${itemData.id}`]: itemData.data,
            [`gear.${itemData.id}.quantity`]: increment(1)
        })
    }
}

module.exports = { addItem };