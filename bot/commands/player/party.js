const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, SelectMenuBuilder, StringSelectMenuBuilder } = require('discord.js');
const { maxParty } = require('../../helper/stats/max_party');
const { Party } = require('../../helper/models/PartyClass');
const { setActive, useCommand } = require('../../../backend/misc/active_users');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('party')
		.setDescription('Check your party and morale.'),
	async execute(interaction) {
        const { user, userData } = await useCommand(interaction); if (userData.closeCommand) return;

        let unitString = '';

        const party = new Party(userData);

        party.shortListWithPromos().forEach(unit => {
            unitString += `${unit}\n`
        })

        console.log(party.shortListWithPromos());

        const promoteMenu = new StringSelectMenuBuilder()

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