const { getDoc, doc } = require("firebase/firestore");
const { db } = require("../../firebase-config")

const getUser = async (user) => {
    const userRef = doc(db, 'users', user.id);

    const userSnap = await getDoc(userRef);
    return userSnap.data();
}

module.exports = { getUser };