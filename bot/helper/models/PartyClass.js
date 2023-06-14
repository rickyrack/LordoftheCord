class Party {
    constructor(party) {
        this.party = party;
    }
    get units() {
        return this.party;
    }
    getUnitType(unitID) {
        return Object.keys(this.party[unitID])[0];
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
    shortList() {
        let unitAmounts = {};
        let uniqueUnits = [];

        Object.keys(this.party).forEach(unitID => {
            let addUnit = true;
            const type = this.getUnitType(unitID);
            uniqueUnits.forEach(unitType => {
                if (unitType === type) {
                    addUnit = false;
                    return;
                }
            })
            if (addUnit) uniqueUnits.push(unitID);
        })

        uniqueUnits.forEach(unitType => {
            unitAmounts[unitType] = 0;
        })

        Object.keys(this.party).forEach(id => {
            uniqueUnits[id]++;
        })

        let amountsArray = [];
        Object.keys(unitAmounts).forEach(unitType => {
            amountsArray.push(`[${unitAmounts[unitType]}] ${unitType}`);
        })
        return amountsArray;
    }
}

module.exports = { Party };