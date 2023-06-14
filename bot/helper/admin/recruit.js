const { addUnits } = require("../../../backend/firestore/utility/add_units");

const adminRecruit = async (user, interaction) => {
    const unitID = interaction.options.getString('unitid');
    const unitAmt = interaction.options.getString('amount');
    const targetUser = interaction.options.getUser('user');

    const result = await addUnits(targetUser, unitID, unitAmt);

    if(result) {
        return interaction.reply(`Added ${unitAmt} [${unitID}] to ${targetUser}`);
    }

    return interaction.reply(`Cannot add ${unitAmt} [${unitID}] to ${targetUser}`);
}

module.exports = { adminRecruit };