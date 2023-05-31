const { collection, getDocs } = require("firebase/firestore")
const { db } = require("../../firebase-config")

const getLocations = async () => {
    const locationsColl = collection(db, 'locations');
    const locationRef = await getDocs(locationsColl);

    const locations = [];

    locationRef.forEach(doc => {
        // needs to cycle through each docs data
        if(Object.keys(doc.data()).length > 0) locations.push(doc.data());

    });

    return locations;
}

module.exports = { getLocations };