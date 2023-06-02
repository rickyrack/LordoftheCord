const { doc, getDoc, updateDoc, increment } = require("firebase/firestore")
const { db } = require("../../firebase-config")

const useItem = async (user, userData, itemID) => {
    const userRef = doc(db, 'users', user.id);
    const userSnap = await getDoc(userRef);

    if(userSnap.data().gear[itemID].quantity === 0) return false;

    const useFood = async () => {
        updateDoc(userRef, {
            'consumeFirst': itemID
        })
    }

    switch (userData.gear[itemID].type) {
        case 'food':
            await useFood();
            return true;
        case 'misc':
            
            break;
        case 'weapons':
            
            break;
        case 'armor':
            
            break;
    
        default:
            return false;
            break;
    }
}

module.exports = { useItem };