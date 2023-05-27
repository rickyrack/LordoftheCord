const { doc, getDocs, collection, updateDoc, increment, getDoc } = require("firebase/firestore")
const { db } = require("../../firebase-config")

const addItem = async (user, itemID) => {
    const userRef = doc(db, 'users', user.id);
    const userSnap = await getDoc(userRef);

    const itemsColl = collection(db, 'items');
    const itemsSnap = await getDocs(itemsColl);

    let itemData = {
        id: '',
        data: {}
    }

    itemsSnap.forEach(doc => {
        console.log(doc.data());
        Object.keys(doc.data()).forEach(item => {
            console.log(item);
            if(item === itemID) {
                console.log('FOUND ITEM');
                itemData.id = item;
                itemData.data = doc.data()[item];
            }
        })
    })

    console.log('HELLO');
    console.log(itemData.id);

    if(userSnap.data().gear?.[itemData.id]?.quantity > 0) {
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