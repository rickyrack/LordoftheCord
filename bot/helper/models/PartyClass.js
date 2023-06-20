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
    getUnitClassByType(unitType) {
        let unitClass = '';
        Object.keys(this.party).forEach(unitId => {
            if (Object.keys(this.party?.[unitId])[0] === unitType) {
                unitClass = this.party[unitId].class;
            }
        })
        return unitClass;
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
            const name = this.party[unit][type].name;
            // first run will always be empty
            uniqueUnits.forEach(unitData => {
                if (unitData.type === type) {
                    addUnit = false;
                    return;
                }
            })
            if (addUnit) uniqueUnits.push({
                type: type,
                name: name,
                otherData: this.party[unit][type]
            })
        })

        uniqueUnits.forEach(unitData => {
            unitAmounts[unitData.type] = {};
            unitAmounts[unitData.type].amount = 0;
            unitAmounts[unitData.type].name = unitData.name;
            unitAmounts[unitData.type].otherData = unitData.otherData; // not always used
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
    shortListWithPromos(format) {
        const shortListRawData = this.shortList('rawData');

        Object.keys(shortListRawData).forEach(unitData => {
            shortListRawData[unitData].promos = 0;
        })

        Object.keys(this.party).forEach(unit => {
            if(this.party[unit][this.getUnitType(unit)].exp >= this.getUnitMaxExp) {
                shortListRawData[this.getUnitType(unit)].promos++;
            }
        })

        // gives data as object instead of string
        if (format === 'object') {
            return shortListRawData;
        }

        let stringArray = [];
        Object.keys(shortListRawData).forEach(unitData => {
            stringArray.push(`[${shortListRawData[unitData].amount}] ${shortListRawData[unitData].name} ${shortListRawData[unitData].promos}+`);
        })
        return stringArray;
    }
    typeList() {
        return this.shortList('rawData');
    }
}

module.exports = { Party };