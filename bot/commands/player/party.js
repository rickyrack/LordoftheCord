const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder } = require('discord.js');
const { userCheck } = require('../../../backend/firestore/utility/user_check');
const { getUser } = require('../../../backend/firestore/utility/get_user');
const { maxParty } = require('../../helper/stats/max_party');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('party')
		.setDescription('Check your party and morale.'),
	async execute(interaction) {
		const user = interaction.user;

		if(!await userCheck(user)) {
			return interaction.reply('Try /start to enter Discordia!')
		}

        const userData = await getUser(user);

        let unitString = '';
        Object.keys(userData.party).forEach(unit => {
            
        })

        const partyEmbed = new EmbedBuilder()
            .setTitle(`${user.username}'s party`)
            .setDescription(`Morale: ${userData.stats.morale}\nParty Size: ${Object.keys(userData.party).length}/${maxParty(userData)} units`)

        return interaction.reply({
            embeds: [partyEmbed]
        });
    }
}