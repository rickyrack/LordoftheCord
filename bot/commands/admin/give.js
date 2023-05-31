const { SlashCommandBuilder } = require('discord.js');
const { adminCheck } = require('../../../backend/firestore/utility/admin_check');
const { userCheck } = require('../../../backend/firestore/utility/user_check');
const { addItem } = require('../../../backend/firestore/utility/add_item');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('give')
		.setDescription("Do not mess with the church!.")
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('User to give a resource to.')
                .setRequired(true))
        .addStringOption(option => 
            option
                .setName('itemid')
                .setDescription('ID of the resource.')
                .setRequired(true)),
	async execute(interaction) {
        const user = interaction.user;

		if(!await userCheck(user)) {
			return interaction.reply("You do not exist.");
		}

        if(!await adminCheck(user)) {
            return interaction.reply("Heresy!")
        }

        const itemID = interaction.options.getString('itemid');
        const targetUser = interaction.options.getUser('user');

        const result = await addItem(user, itemID);

        if(result) {
            return interaction.reply(`Added 1 ${itemID} to ${targetUser}`);
        }

        return interaction.reply(`Cannot add ${itemID} to ${targetUser}`);
	},
};