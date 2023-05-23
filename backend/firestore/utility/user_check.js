// checks if user exists for other functions
// to be used with

const { doc, getDoc } = require("firebase/firestore");
const { db } = require("../../firebase-config");

const userCheck = async (user) => {
    const userRef = doc(db, 'users', user.id);
    const userSnap = await getDoc(userRef);
    
    // check user already exists
    const exists = userSnap.exists();
    if(exists) {
        return true;
    }
}

module.exports = { userCheck };