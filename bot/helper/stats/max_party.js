const maxParty = (userData) => {
    return userData.stats.party.leadership * (6 + Math.floor(userData.stats.party.leadership / 2))
}

module.exports = { maxParty };