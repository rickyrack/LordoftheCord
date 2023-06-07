const { collection, getDocs } = require("firebase/firestore")
const { db } = require("../../firebase-config")

const getLocations = async () => {
    const locationsColl = collection(db, 'locations');
    const locationRef = await getDocs(locationsColl);

    const locations = [];

    locationRef.forEach(doc => {
        // needs to cycle through each docs data
        if(Object.keys(doc.data()).length > 0) {
            Object.keys(doc.data()).forEach(location => {
                const locationData = doc.data()[location];
                locationData.type = doc.id.charAt(0).toUpperCase() + doc.id.slice(1);;
                console.log(locationData);
                locations.push(location = locationData);
            })
        }
    });

    return locations;
}

module.exports = { getLocations };