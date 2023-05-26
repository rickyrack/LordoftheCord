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
        coords: [50, 50],
        stats: {
            health: 100,
            morale: 80,
            hunger: 80,
            thirst: 80
        },
        gear: {
            Canteen_Full: {
                    weight: 'temp',
                    thirst: 40,
                    name: 'Canteen',
                    id: 'Canteen_Full',
                    amt: 1
            }

        }
    })
}

module.exports = { start };