const { doc, getDoc, updateDoc, increment } = require("firebase/firestore")
const { db } = require("../../firebase-config")

// updates morale or returns that an action cannot be done
const updateMorale = async (user, action, multiplier, userData) => {
    const userRef = doc(db, 'users', user.id);

    // userData is optional and will make function faster if provided
    if(!userData) {
        const userSnap = await getDoc(userRef);
        userData = userSnap.data();
    }

    // mult not always necessary
    if(!multiplier) multiplier = 1;

    let moraleChange = 0;
    switch (action) {
        case 'explore':
            moraleChange = 3;
            break;
    }

    moraleChange = moraleChange * multiplier;
    if (userData.stats.morale - moraleChange <= 0) return false;
    else {
        updateDoc(userRef, {
            'stats.morale': increment(-moraleChange)
        });
        return true;
    }
}

module.exports = { updateMorale };