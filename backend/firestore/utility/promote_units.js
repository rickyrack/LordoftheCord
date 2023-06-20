const { doc } = require("firebase/firestore")
const { db } = require("../../firebase-config")

const promoteUnits = (user, units) => {
    const userRef = doc(db, 'users', user.id);
    
    
}