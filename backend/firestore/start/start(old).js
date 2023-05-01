const { doc, setDoc, getDoc } = require("@firebase/firestore");
const { db } = require("../../firebase-config")

const start = async (user) => {
    const userRef = doc(db, 'users', user.id);

    const date = new Date();
    await setDoc(userRef, {
        created: date.toLocaleDateString(),
        id: user.id,
        username: user.username,
        rank: 'player',
        stats: {
            health: 100,
            stamina: 100,
            hunger: 80,
            thirst: 80
        },
        backpack: {
            Water_Bottle: {
                    weight: 'temp',
                    thirst: 40,
                    name: 'Water Bottle',
                    id: 'Water_Bottle',
                    amt: 1
            }

        }
    })
}

module.exports = { start };