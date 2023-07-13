const { getPromos } = require("../../../backend/firestore/utility/get_promos");

class Party {
    constructor(userData) {
        this.party = userData.party;
        this.stats = userData.stats;
    }
    getUnitMaxExp(unitID) {
        const rank = this.party[unitID].rank;
        return rank * 15;
    }
    getUnitPromoCost(unitID) {
        const rank = this.party[unitID].rank;
        return rank * 20;
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
            list.push(this.party[unit][this.getUnitType(unit)].name);
        })
        return list;
    }
    list() {
        // manipulates data so it can be used as a basis for other methods, also useful as is
        const units = [];
        const partyData = JSON.parse(JSON.stringify(this.party)); // this prevents the original this.party from being modified
        Object.keys(partyData).forEach(unitID => {
            let canPromote = false;
            if (partyData[unitID].exp >= this.getUnitMaxExp(unitID)) {
                canPromote = true;
            }
            partyData[unitID].canPromote = canPromote;
            units.push(partyData[unitID]);
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

            if(!condenseUnits[unit.type].promos && unit.promote[0] !== 'max') {
                condenseUnits[unit.type].promos = 0;
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
                    delete condenseUnits[unitType].exp;
                    delete condenseUnits[unitType].UID;
                    delete condenseUnits[unitType].canPromote;
                }
            })
        })
        return condenseUnits;
    }
    promoAvailable(unitType) {
        const units = this.list();
        const promoAvailable = [];
        units.forEach(unit => {
            if(unit.type === unitType) {
                if(this.getUnitMaxExp(unit.UID) <= unit.exp) {
                    promoAvailable.push(unit.UID);
                }
            }
        })
        return promoAvailable;
    }
    async getPromoTypes(typeData) {
        return await getPromos(typeData);
    }
    textSummary() {
        const shortList = this.shortList();
        const textList = [];

        Object.keys(shortList).forEach(unit => {
            const unitData = shortList[unit];
            if(unitData.promos === 0 || !unitData.promos) {
                textList.push(`${unitData.name} [${unitData.amt}]`);
            }
            else {
                textList.push(`${unitData.name} [${unitData.amt}] +${unitData.promos}^`);
            }
        })

        return textList;
    }
    
}

module.exports = { Party };