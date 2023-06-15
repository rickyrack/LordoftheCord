const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, SelectMenuBuilder, StringSelectMenuBuilder } = require('discord.js');
const { userCheck } = require('../../../backend/firestore/utility/user_check');
const { getUser } = require('../../../backend/firestore/utility/get_user');
const { maxParty } = require('../../helper/stats/max_party');
const { Party } = require('../../helper/models/PartyClass');
const { setActive, useCommand } = require('../../../backend/misc/active_users');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('party')
		.setDescription('Check your party and morale.'),
	async execute(interaction) {
        const { user, userData } = await useCommand(interaction);
		/*const user = interaction.user;

		if(!await userCheck(user)) {
			return interaction.reply('Try /start to enter Discordia!');
		}

        const userData = await getUser(user);*/

        let unitString = 'test';

        const party = new Party(userData);

        console.log(party.shortList());

        const promoteMenu = new StringSelectMenuBuilder()

        // LEFT OFF NOTES
        // FIX SHORTLIST (run /party and check console to see problem)

        // NEED JSON DOC TO SHOW WHEN USER IS ACTIVE/HAS ACTIVE COMMAND
        // SO THAT TWO CANNOT BE USED AT SAME TIME, FIRESTORE WOULD BE TOO SLOW

        // MAKE CLASS FOR ALL USERDATA WITH FUNCTIONS??

        const partyEmbed = new EmbedBuilder()
            .setTitle(`${user.username}'s party`)
            .setDescription(`Morale: ${userData.stats.morale}\nParty Size: ${Object.keys(userData.party).length}/${maxParty(userData)} units`)
            .addFields({name: `${unitString}`, value:' '})

        //setActive(user.id, false);
        return interaction.reply({
            embeds: [partyEmbed]
        });
    }
}