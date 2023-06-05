const { getDoc, updateDoc, doc } = require("firebase/firestore");
const { db } = require("../../firebase-config");

// use to update user's equipped gear if user is
// missing the gear in their inventory

const updateEquipped = async (user, userData) => {
    const userRef = doc(db, 'users', user.id);

    // userData is optional and will make function faster if provided
    if(!userData) {
        const userSnap = await getDoc(userRef);
        userData = userSnap.data();
    }

    const equipped = userData.equipped;
    Object.keys(equipped).forEach(type => {
        let removeEquip = true;
        if(type === 'amulet') {
            Object.keys(userData.gear).forEach(itemID => {
                if (itemID === equipped.amulet) removeEquip = false;
                if (removeEquip) {
                    updateDoc(userRef, {
                        'equipped.amulet': ""
                    })
                }
            })
            return;
        }
        Object.keys(equipped[type]).forEach(slot => {
            Object.keys(userData.gear).forEach(itemID => {
                if (itemID === equipped[type][slot]) removeEquip = false;
            })
            if(removeEquip) {
                updateDoc(userRef, {
                    [`equipped.${[type]}.${[slot]}`]: ""
                })
            }
        })
    })
}

module.exports = { updateEquipped };