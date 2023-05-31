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

    let itemExists = false;

    itemsSnap.forEach(doc => {
        Object.keys(doc.data()).forEach(item => {
            if(item === itemID) {
                itemExists = true;
                itemData.id = item;
                const data = doc.data()[item];
                data.type = doc.id;
                itemData.data = data;
            }
        })
    })

    if(!itemExists) return false;

    if(userData.gear?.[itemData.id]?.quantity > 0) {
        await updateDoc(userRef, {
            [`gear.${itemData.id}.quantity`]: increment(1)
        })
    }
    else {
        console.log(itemData.data)
        await updateDoc(userRef, {
            [`gear.${itemData.id}`]: itemData.data,
            [`gear.${itemData.id}.quantity`]: increment(1)
        })
    }

    return true;
}

module.exports = { addItem };