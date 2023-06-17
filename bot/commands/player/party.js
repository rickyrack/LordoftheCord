const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, SelectMenuBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ActionRow, StringSelectMenuOptionBuilder } = require('discord.js');
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

        const partySelect = new StringSelectMenuBuilder()
        .setCustomId('unit')
        .setPlaceholder('No Unit Selected')
        .setMinValues(1)
        .setMaxValues(party.shortList().length)

        let counter = 0;
        party.shortListWithPromos().forEach(unit => {
            unitString += `${unit}\n`
            counter++;
            partySelect.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`${counter}`)
                    .setDescription(`${counter}`)
                    .setValue(`${counter}`)
            )
        })

        console.log(party.shortListWithPromos());

        const noParty = Object.keys(userData.party).length === 0 ? true : false;

        if (noParty) {
          unitString = 'You have no party members!'
        }

        const partyEmbed = new EmbedBuilder()
            .setTitle(`${user.username}'s party`)
            .setDescription(`Morale: ${userData.stats.morale}\nParty Size: ${Object.keys(userData.party).length}/${maxParty(userData)} units`)
            .addFields({name: `${unitString}`, value:' '})

        // Party Editing Buttons
        // promotion
        const promoteOne = new ButtonBuilder()
            .setCustomId('promoOne')
            .setLabel('Promote One')
            .setStyle(ButtonStyle.Success)
            .setDisabled(true)
        const promoteSelected = new ButtonBuilder()
            .setCustomId('promoGroup')
            .setLabel('Promote Group')
            .setStyle(ButtonStyle.Success)
        const promoteAll = new ButtonBuilder()
            .setCustomId('promoParty')
            .setLabel('Promote All')
            .setStyle(ButtonStyle.Success)
        // dismiss
        const dismissOne = new ButtonBuilder()
            .setCustomId('dismissOne')
            .setLabel('Dismiss One')
            .setStyle(ButtonStyle.Danger)
        const dismissSelected = new ButtonBuilder()
            .setCustomId('dismissGroup')
            .setLabel('Dismiss Group')
            .setStyle(ButtonStyle.Danger)
        const disbandParty = new ButtonBuilder()
            .setCustomId('disband')
            .setLabel('Disband Party')
            .setStyle(ButtonStyle.Danger)

        const partySelectRow = new ActionRowBuilder()
            .addComponents(
                partySelect
            )

        const promoRow = new ActionRowBuilder()
            .addComponents(
                promoteOne,
                promoteSelected,
                promoteAll
            )

        const dismissRow = new ActionRowBuilder()
            .addComponents(
                dismissOne,
                dismissSelected,
                disbandParty
            )

        let message;

        // setActive(user.id, false);
        message = await interaction.reply({
            embeds: [partyEmbed],
            components: [partySelectRow, promoRow, dismissRow]
        });

        const partyFilter = i => {
            return i.user.id === user.id;
        }

        const partyCollector = message.createMessageComponentCollector({
            filter: partyFilter,
            time: 60000
        })

        partyCollector.on('collect', async i => {
            promoteOne.setDisabled(false);
            message = await interaction.editReply({
                embeds: [partyEmbed],
                components: [promoRow]//[partySelectRow, promoRow, dismissRow]
            });
            partyCollector.stop();
        })

        partyCollector.on('end', async (collected, reason) => {

        })
    }
}