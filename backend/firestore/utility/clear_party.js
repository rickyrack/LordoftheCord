const { doc, updateDoc } = require("firebase/firestore")
const { db } = require("../../firebase-config")

const clearParty = async (user) => {
    const userRef = doc(db, 'users', user.id);

    updateDoc(userRef, {
        party: {}
    })

    return true;
}

module.exports = { clearParty };