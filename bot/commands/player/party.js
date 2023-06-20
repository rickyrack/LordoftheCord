const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, SelectMenuBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ActionRow, StringSelectMenuOptionBuilder } = require('discord.js');
const { maxParty } = require('../../helper/stats/max_party');
const { Party } = require('../../helper/models/PartyClass');
const { setActive, useCommand } = require('../../../backend/misc/active_users');
const { getUser } = require('../../../backend/firestore/utility/get_user');
const { getPromoOptions } = require('../../../backend/firestore/utility/get_promo_options');

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

        party.shortListWithPromos().forEach(unit => {
            unitString += `${unit}\n`
        })

        console.log(party.typeList())
        let counter = 0;
        const typeList = party.typeList();
        Object.keys(typeList).forEach(unit => {
            console.log([unit].name)
            partySelect.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`${typeList[unit].name}`)
                    .setDescription(`Amount: ${typeList[unit].amount} Rank: blah Class: blah`)
                    .setValue(`${counter}`)
            )
            counter++;
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
        // const promoteOne = new ButtonBuilder()
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
            .setStyle(ButtonStyle.Secondary)

        const partySelectRow = new ActionRowBuilder()
            .addComponents(
                partySelect
            )

        const promoRow = new ActionRowBuilder()
            .addComponents(
                //promoteOne,
                promoteSelected,
                promoteAll
            )

        const dismissRow = new ActionRowBuilder()
            .addComponents(
                dismissOne,
                dismissSelected
            )

        const disbandRow = new ActionRowBuilder()
            .addComponents(
                disbandParty
            )

        let message;

        if(firstOpen) {
            firstOpen = false;
            message = await interaction.reply({
                embeds: [partyEmbed],
                components: [partySelectRow, promoRow, dismissRow, disbandRow]
            });
        }
        else {
            message = await interaction.editReply({
                content: '',
                embeds: [partyMsg, partyEmbed],
                components: [partySelectRow, promoRow, dismissRow, disbandRow]
            });
        }

        const partyFilter = i => {
            return i.user.id === user.id && i.customId !== 'type1' && i.customId !== 'type2' && i.customId !== 'type3';
        }

        const partyCollector = message.createMessageComponentCollector({
            filter: partyFilter,
            time: 60000
        })

        const promote = async (promoType, unitData) => {
            switch (promoType) {
                case 'promoGroup':
                    console.log(unitData);
                    const promoData = await getPromoOptions(unitData, party);

                    const promoGroupEmbed = new EmbedBuilder()
                        .setTitle('Select a promotion for each unit.')
                        .setDescription("Auto promote will use this unit's class tree for all remaining units.")

                    const autoPromote = new ButtonBuilder()
                        .setCustomId('auto')
                        .setLabel('Auto')
                        .setStyle(ButtonStyle.Primary)

                    const promoButtons = [];
                    promoData.promoOptions.forEach(option => {
                        promoButtons.push(
                            new ButtonBuilder()
                                .setCustomId(`${option.id}`)
                                .setLabel(`${option.name}`)
                                .setStyle(ButtonStyle.Success)
                        )
                    })

                    promoButtons.push(autoPromote);

                        /*promoGroupEmbed.addFields({
                            name: `${unitType} ==>`, value: ''
                        })*/

                    const promoRow = new ActionRowBuilder()
                        .addComponents(
                            promoButtons
                        )

                    let promoCounter = promoData.promoAmt;

                    message = interaction.editReply({
                        content: '',
                        embeds: [promoGroupEmbed],
                        components: [promoRow]
                    })

                    const promoFilter = i => {
                        return i.user.id === user.id;
                    }

                    const promoCollector = message.createMessageComponentCollector({
                        filter: promoFilter,
                        time: 60000
                    })

                    promoCollector.on('collect', async i => {
                        const buttonID = i.customId;
                        await promoteUnits(buttonID);

                    })

                    promoCounter++;
                    break;
                case 'promoParty':

                    break;
            }
        }

        const dismiss = async (promoType, unitType) => {

        }

        let unitChoices = [];
        partyCollector.on('collect', async selectInt => {
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
                /*if (unitChoices.length > 0 && selectInt.customId === 'promoOne' || selectInt.customId === 'dismissOne') {
                    // handles promoting one unit with too many selected
                    await selectInt.update({
                        content: "Loading...",
                        });
                    partyCollector.stop('too many units');
                    desc = 'Select one unit type to promote a single unit.';
                    return partyFunction(desc);
                }*/
                const unitSelection = {
                    [Object.keys(typeList)[unitChoices[0]]]: typeList[Object.keys(typeList)[unitChoices[0]]]
                } // gets corressponding numbered unit
                console.log('HELLO')
                console.log(typeList)
                console.log('bye')
                console.log(unitSelection)
                if (selectInt.customId === 'promoGroup' || selectInt.customId === 'promoParty') {
                    console.log(selectInt.customId)
                    await promote(selectInt.customId, unitSelection);
                }
                else if (selectInt.customId === 'dismissOne' || selectInt.customId === 'dismissGroup' || selectInt.customId === 'disbandParty') {
                    console.log(selectInt.customId)
                    await dismiss(selectInt.customId, unitSelection);
                }
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