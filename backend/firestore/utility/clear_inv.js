const { doc, updateDoc } = require("firebase/firestore")
const { db } = require("../../firebase-config")

const clearInv = async (user) => {
    const userRef = doc(db, 'users', user.id);

    updateDoc(userRef, {
        gear: {}
    })

    return true;
}

module.exports = { clearInv };