const { doc, setDoc, getDoc } = require("@firebase/firestore");
const { db } = require("../../firebase-config")

const start = async (user) => {
    const userRef = doc(db, 'users', user.id);

    const date = new Date();
    await setDoc(userRef, {
        created: date.toLocaleDateString(),
        id: user.id,
        username: user.username,
        admin: false,
        coords: {
            x: 54,
            y: 47
        },
        stats: {
            health: 100,
            morale: 80,
            level: 1,
            player: {},
            party: {
                exploration: 1,
                speed: 1,
                leadership: 1,
                spotting: 1,
                training: 1,
                upkeep: 1 // affects cost of pay AND morale loss
            }
        },
        gear: {},
        party: {}
    });


}

module.exports = { start };