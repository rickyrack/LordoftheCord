const { SlashCommandBuilder } = require('discord.js');
const { adminCheck } = require('../../../backend/firestore/utility/admin_check');
const { userCheck } = require('../../../backend/firestore/utility/user_check');
const { useResource } = require('../../../backend/firestore/utility/use_resource');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('use')
		.setDescription("This one's for management.")
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('User to use a resource on.')
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

        const result = await useResource(resourceID, targetUser.id, true);

        if(result) {
            return interaction.reply(`Used 1 ${resourceID} on ${targetUser}`);
        }

        return interaction.reply(`Cannot use ${resourceID} on ${targetUser}`);
	},
};