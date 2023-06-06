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

    // mult not always necessary but should be sent as 1 in that case
    if(!multiplier) multiplier = 1;

    let moraleChange = 0;
    switch (action) {
        case 'explore':
            moraleChange = 10;
            break;
        case 'move':
            moraleChange = Math.ceil(0.4 * (1 + Object.keys(userData.party).length));
            break;
    }

    const upkeepModifier = 1 - userData.stats.party.upkeep * .05;

    moraleChange = Math.ceil(moraleChange * multiplier * upkeepModifier);
    if (userData.stats.morale - moraleChange <= 0) return false;
    else {
        updateDoc(userRef, {
            'stats.morale': increment(-moraleChange)
        });
        return true;
    }
}

module.exports = { updateMorale };