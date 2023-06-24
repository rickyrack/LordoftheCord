class Party {
    constructor(userData) {
        this.party = userData.party;
        this.stats = userData.stats;
    }
    getUnitMaxExp(unitID) {
        const rank = this.party[unitID].rank;
        return rank * 15;
    }
    maxSize() {
        return this.stats.party.leadership * (6 + Math.floor(this.stats.party.leadership / 2))
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
    list() {
        // manipulates data so it can be used as a basis for other methods, also useful as is
        const units = [];
        Object.keys(this.party).forEach(unitID => {
            let canPromote = false;
            if (this.party[unitID].exp >= this.getUnitMaxExp(unitID)) {
                canPromote = true;
            }
            units.push(this.party[unitID]);
            this.party[unitID].canPromote = canPromote;
        })
        return units;
    }
    shortList() {
        const units = this.list();
        const condenseUnits = {};

        units.forEach(unit => {
            condenseUnits[unit.type] = {};
        })

        units.forEach(unit => {
            // add another for all manipulated/condensed data, make sure to add it to forEach function below as well
            condenseUnits[unit.type].amt >= 1 ? condenseUnits[unit.type].amt++ : condenseUnits[unit.type].amt = 1;
            if(unit.canPromote === true) {
                condenseUnits[unit.type].promos >= 1 ? condenseUnits[unit.type].promos++ : condenseUnits[unit.type].promos = 1;
            }
        })

        // the forEach in question -->
        Object.keys(condenseUnits).forEach(unitType => {
            const totalType = condenseUnits[unitType].amt;
            const totalPromos = condenseUnits[unitType].promos;
            units.forEach(unit => {
                if (unitType === unit.type) {
                    condenseUnits[unitType] = unit;
                    condenseUnits[unitType].amt = totalType;
                    condenseUnits[unitType].promos = totalPromos;
                }
            })
        })
        return condenseUnits;
    }
    textSummary() {
        const shortList = this.shortList();
        const textList = [];

        console.log(shortList)

        Object.keys(shortList).forEach(unit => {
            const unitData = shortList[unit];
            textList.push(`${unitData.name} [${unitData.amt}] +${unitData.promos}^`);
        })

        return textList;
    }
}

module.exports = { Party };