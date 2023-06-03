const { doc, getDoc, updateDoc, increment } = require("firebase/firestore")
const { db } = require("../../firebase-config")

const useItem = async (user, userData, itemID, replace) => {
    const userRef = doc(db, 'users', user.id);
    const userSnap = await getDoc(userRef);

    if(userSnap.data().gear[itemID].quantity === 0) return false;

    const useFood = async () => {
        updateDoc(userRef, {
            'consumeFirst': itemID
        })
    }

    const useWeapon = async () => {
        let oldSlot = null;
        Object.keys(userSnap.data().equipped.hand).forEach(slot => {
            if(userSnap.data().equipped.hand[slot] === itemID) oldSlot = slot;
        })
        if(oldSlot) {
            updateDoc(userRef, {
                [`equipped.hand.${[oldSlot]}`]: ""
            })
        }
        updateDoc(userRef, {
            [`equipped.hand.${[replace]}`]: itemID
        })
    }

    switch (userData.gear[itemID].type) {
        case 'food':
            await useFood();
            return true;
        case 'misc':
            
            break;
        case 'weapons':
            await useWeapon();
            return true;
        case 'armor':
            
            break;
        case 'amulet':
            
            break;
        default:
            return false;
    }
}

module.exports = { useItem };