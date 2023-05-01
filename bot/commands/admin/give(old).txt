const { SlashCommandBuilder } = require('discord.js');
const { adminCheck } = require('../../../backend/firestore/utility/admin_check');
const { userCheck } = require('../../../backend/firestore/utility/user_check');
const { addResource } = require('../../../backend/firestore/utility/add_resource');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('give')
		.setDescription("This one's for management.")
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('User to give a resource to.')
                .setRequired(true))
        .addStringOption(option => 
            option
                .setName('resourceid')
                .setDescription('ID of the resource.')
                .setRequired(true)),
	async execute(interaction) {
        const user = interaction.user;

		if(!await userCheck(user)) {
			return interaction.reply("You do not exist.");
		}

        if(!await adminCheck(user)) {
            return interaction.reply("You are not management.")
        }

        const resourceID = interaction.options.getString('resourceid');
        const targetUser = interaction.options.getUser('user');

        const result = await addResource(resourceID, targetUser.id);

        if(result) {
            return interaction.reply(`Added 1 ${resourceID} to ${targetUser}`);
        }

        return interaction.reply(`Cannot add ${resourceID} to ${targetUser}`);
	},
};