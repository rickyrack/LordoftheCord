const { doc, getDoc } = require("firebase/firestore")
const { db } = require("../../firebase-config")

const adminCheck = async (user) => {
    const userRef = doc(db, 'users', user.id);
    const userSnap = await getDoc(userRef);

    if(userSnap.data()?.rank === 'admin') {
        return true;
    }

    return false;
}

module.exports = { adminCheck };