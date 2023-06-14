const { addItem } = require("../../../backend/firestore/utility/add_item");

const adminGive = async (user, interaction) => {
    const itemID = interaction.options.getString("itemid");
    const targetUser = interaction.options.getUser("user");
    
    const result = await addItem(targetUser, itemID);
    
    if (result) {
      return interaction.reply(`Added 1 ${itemID} to ${targetUser}`);
    }
    
    return interaction.reply(`Cannot add ${itemID} to ${targetUser}`);
}

module.exports = { adminGive };
