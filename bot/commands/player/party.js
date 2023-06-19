const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, SelectMenuBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ActionRow, StringSelectMenuOptionBuilder } = require('discord.js');
const { maxParty } = require('../../helper/stats/max_party');
const { Party } = require('../../helper/models/PartyClass');
const { setActive, useCommand } = require('../../../backend/misc/active_users');
const { getUser } = require('../../../backend/firestore/utility/get_user');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('party')
		.setDescription('Check your party and morale.'),
	async execute(interaction) {
        let { user, userData } = await useCommand(interaction, true); if (userData.closeCommand) return;

        let firstOpen = true;

        await partyFunction();
        async function partyFunction(partyDesc) {
        console.log('START FUNC')
        userData = await getUser(user);
        if (!userData) userData = await getUser(user); // TEMP BUG FIX
        
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

        const partyMsg = new EmbedBuilder()
            .setTitle(`${partyDesc}`)

        // Party Editing Buttons
        // promotion
        const promoteOne = new ButtonBuilder()
            .setCustomId('promoOne')
            .setLabel('Promote 1 Unit')
            .setStyle(ButtonStyle.Success)
        const promoteSelected = new ButtonBuilder()
            .setCustomId('promoGroup')
            .setLabel('Promote Units')
            .setStyle(ButtonStyle.Success)
        const promoteAll = new ButtonBuilder()
            .setCustomId('promoParty')
            .setLabel('Promote All Units')
            .setStyle(ButtonStyle.Success)
        // dismiss
        const dismissOne = new ButtonBuilder()
            .setCustomId('dismissOne')
            .setLabel('Dismiss 1 Unit')
            .setStyle(ButtonStyle.Danger)
        const dismissSelected = new ButtonBuilder()
            .setCustomId('dismissGroup')
            .setLabel('Dismiss Units')
            .setStyle(ButtonStyle.Danger)
        const disbandParty = new ButtonBuilder()
            .setCustomId('disbandParty')
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

        if(firstOpen) {
            firstOpen = false;
            message = await interaction.reply({
                embeds: [partyEmbed],
                components: [partySelectRow, promoRow, dismissRow]
            });
        }
        else {
            message = await interaction.editReply({
                content: '',
                embeds: [partyMsg, partyEmbed],
                components: [partySelectRow, promoRow, dismissRow]
            });
        }

        const partyFilter = i => {
            return i.user.id === user.id;
        }

        const partyCollector = message.createMessageComponentCollector({
            filter: partyFilter,
            time: 60000
        })

        let unitChoices = [];
        partyCollector.on('collect', async selectInt => {
            let buttonChoice;
            let desc = '';
            if (!selectInt?.values && unitChoices.length === 0) { // button press without unit selected
                await selectInt.update({
                    content: "Loading...",
                  });
                partyCollector.stop('no unit');
                desc = 'You did not select a unit/units!';
                return partyFunction(desc);
            }
            else if (unitChoices.length > 0) { // button press with unit selected
                if (unitChoices.length > 0 && selectInt.customId === 'promoOne' || selectInt.customId === 'dismissOne') {
                    // handles promoting one unit with too many selected
                    await selectInt.update({
                        content: "Loading...",
                        });
                    partyCollector.stop('too many units');
                    desc = 'Select one unit type to promote a single unit.';
                    return partyFunction(desc);
                }
                else if (selectInt.customId === 'promo')
                console.log(selectInt.customId)
            }
            else { // select menu
                unitChoices = selectInt.values;
                await selectInt.deferUpdate();
            }
        })

        partyCollector.on('end', async (collected, reason) => {
            if(reason === 'no unit') {
                console.log('no unit selected');
            }
        })
    }
    }
}