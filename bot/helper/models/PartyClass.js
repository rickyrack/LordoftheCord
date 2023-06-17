class Party {
    constructor(userData) {
        this.party = userData.party;
        this.stats = userData.stats;
    }
    get units() {
        return this.party;
    }
    getUnitType(unitID) {
        return Object.keys(this.party[unitID])[0];
    }
    getUnitMaxExp(unitID) {
        const rank = this.party[unitID][this.getUnitType(unitID)].rank;
        // const currentExp = this.party[unitID][this.getUnitType(unitID)].exp;
        return rank * 15;
    }
    length() {
        return Object.keys(this.party).length;
    }
    longList() {
        let list = [];
        Object.keys(this.party).forEach(unit => {
            console.log(this.getUnitType(unit));
            list.push(this.party[unit][this.getUnitType(unit)].name);
        })
        return list;
    }
    shortList(dataType) {
        let unitAmounts = {};
        let uniqueUnits = [];

        Object.keys(this.party).forEach(unit => {
            let addUnit = true;
            const type = this.getUnitType(unit);
            const name = this.party[unit][this.getUnitType(unit)].name;
            // first run will always be empty
            uniqueUnits.forEach(unitData => {
                if (unitData.type === type) {
                    addUnit = false;
                    return;
                }
            })
            if (addUnit) uniqueUnits.push({
                type: type,
                name: name
            })
        })

        uniqueUnits.forEach(unitData => {
            unitAmounts[unitData.type] = {};
            unitAmounts[unitData.type].amount = 0;
            unitAmounts[unitData.type].name = unitData.name;
        })

        Object.keys(this.party).forEach(unit => {
            unitAmounts[this.getUnitType(unit)].amount++;
        })

        // for methods that dont need the finalized array with strings, just data
        if (dataType === 'rawData') return unitAmounts;

        let stringArray = [];
        Object.keys(unitAmounts).forEach(unitData => {
            stringArray.push(`[${unitAmounts[unitData].amount}] ${unitAmounts[unitData].name}`);
        })
        return stringArray;
    }
    shortListWithPromos() {
        const shortListRawData = this.shortList('rawData');

        Object.keys(shortListRawData).forEach(unitData => {
            shortListRawData[unitData].promos = 0;
        })

        Object.keys(this.party).forEach(unit => {
            if(this.party[unit][this.getUnitType(unit)].exp >= this.getUnitMaxExp) {
                shortListRawData[this.getUnitType(unit)].promos++;
            }
        })

        let stringArray = [];
        Object.keys(shortListRawData).forEach(unitData => {
            stringArray.push(`[${shortListRawData[unitData].amount}] ${shortListRawData[unitData].name} ${shortListRawData[unitData].promos}+`);
        })
        return stringArray;
    }
}

module.exports = { Party };