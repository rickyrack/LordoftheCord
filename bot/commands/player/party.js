const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require("discord.js");
const { Party } = require("../../helper/models/PartyClass");
const { useCommand, setActive } = require("../../../backend/misc/active_users");
const { getUser } = require("../../../backend/firestore/utility/get_user");
const { promoteUnit } = require("../../../backend/firestore/utility/promote_unit");
const { dismissUnits } = require("../../../backend/firestore/utility/dismiss_units");

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
        
        let unitString = ' ';

        const party = new Party(userData);

            const noParty = party.length() === 0 ? true : false;

            if (noParty) {
              unitString = 'You have no party members!'
            }
            else {
                party.textSummary().forEach(unit => {
                    unitString += `${unit}\n`
                })
            }

            const partySelect = new StringSelectMenuBuilder()
        .setCustomId('unit')
        .setPlaceholder('No Unit Selected')

        const shortList = party.shortList();
        Object.keys(shortList).forEach(unit => {
            partySelect.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`${shortList[unit].name}`)
                    .setDescription(`Amount: [${shortList[unit].amt}] Promotions: [${shortList[unit].promos || 0}] Rank: [${shortList[unit].rank}] Class: [${shortList[unit].class}]`)
                    .setValue(`${shortList[unit].type}`)
            )
        })

        const partySelectRow = new ActionRowBuilder()
        .addComponents(
            partySelect
        )
    
            const partyEmbed = new EmbedBuilder()
                .setTitle(`${user.username}'s party`)
                .setDescription(`:slight_smile: ${userData.stats.morale}\n<:PartySize:1129186732479369266> ${party.length()}/${party.maxSize()} units\n<:Gold:1129184925418000454> ${userData.stats.gold}`)
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
                .setDisabled(true)
            // dismiss
            const dismissOne = new ButtonBuilder()
                .setCustomId('dismissOne')
                .setLabel('Dismiss 1 Unit')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true)
            const dismissSelected = new ButtonBuilder()
                .setCustomId('dismissGroup')
                .setLabel('Dismiss Units')
                .setStyle(ButtonStyle.Danger)
            const disbandParty = new ButtonBuilder()
                .setCustomId('disbandParty')
                .setLabel('Disband Party')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)

            const closeParty = new ButtonBuilder()
                .setCustomId('close')
                .setLabel('Close')
                .setStyle(ButtonStyle.Primary)
    
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
                    disbandParty,
                    closeParty
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
                    content: ' ',
                    embeds: [partyMsg, partyEmbed],
                    components: [partySelectRow, promoRow, dismissRow, disbandRow]
                });
            }

            const partyFilter = i => {
                return i.user.id === user.id;
            }

            const partyCollector = message.createMessageComponentCollector({
                filter: partyFilter,
                time: 60000
            })

            let unitChoice = null;
            let collectorState = null;
            let promoGroupEmbed = new EmbedBuilder();
            let promoOptionsRow = new ActionRowBuilder();
            let promoCancelRow = new ActionRowBuilder();
            let active = null;
            let promoChoice = '';
            let promoTypes = [];
            let firstPromo = true;
            let promoMsg = ' ';
            let promoCounter = 0;
            let promoUnits = [];
            let tempGold = userData.stats.gold;
            let timeout = true;
            let promoCost = 0;
            
            let dismissGroupEmbed = new EmbedBuilder();
            let dismissSelect = new StringSelectMenuBuilder();
            let dismissSelectRow = new ActionRowBuilder();
            let dismissMsg = ' ';
            let dismissChoice = '';
            let canDismiss = false;

            partyCollector.on('collect', async i => {
                let intType = i.customId !== 'unit'
                ? 'other'
                : 'unitSelect';

                if (intType === 'unitSelect') {
                    unitChoice = i.values[0];
                    i.deferUpdate();
                }

                switch (active) {
                    case 'dismissGroup':
                        collectorState = i.values[0];
                        break;
                
                    default:
                        collectorState = i.customId;
                        break;
                }

                if(collectorState === 'close') {
                    const closeEmbed = new EmbedBuilder().setTitle("You stopped speaking to your party.");
                      setActive(user.id, false);
                      partyCollector.stop('Close Party');
                      return i.update({
                        content: "",
                        embeds: [closeEmbed],
                        components: []
                      });
                    }

                if (!unitChoice && collectorState !== 'promoParty' && collectorState !== 'disbandParty') {
                    i.update(' '); //i.update('Loading...'); "loading was sometimes staying on screen <-- temp fix"
                    partyFunction('You must select a unit first!');
                    collectorState = null;
                    partyCollector.stop('No Unit Type Selected');
                    return;
                }

                const promote = async (typeData) => {
                    promoGroupEmbed
                        .setTitle(`Select a promotion for each [${typeData.name}].\n${tempGold} <:Gold:1129184925418000454>`)
                        .setDescription(`Auto promote will use the [${typeData.class}] tree for all remaining units.`)

                    const autoPromote = new ButtonBuilder()
                        .setCustomId('auto')
                        .setLabel('Auto')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true)

                    const cancelPromote = new ButtonBuilder()
                        .setCustomId('cancelPromo')
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Danger)

                    const promoButtons = [];
                    if(firstPromo) { //based on unit type and not unit id, later it will be id based to account for unique unit upgrades/promotions
                        firstPromo = false;
                        promoUnits = party.promoAvailable(typeData.type);
                        promoCounter = promoUnits.length;
                        promoCost = party.getUnitPromoCost(promoUnits[promoCounter - 1]); // applies the same cost to all units of same type
                        promoTypes = await party.getPromoTypes(typeData);
                        promoTypes.forEach(unitType => {
                            promoButtons.push(
                                new ButtonBuilder()
                                    .setCustomId(`${unitType.id}`)
                                    .setLabel(`${unitType.name} [${promoCost} Gold]`)
                                    .setStyle(ButtonStyle.Success)
                            )
                        })
    
                        promoButtons.push(autoPromote);

                        promoOptionsRow
                            .addComponents(
                                promoButtons
                            )
                        promoCancelRow
                            .addComponents(
                                cancelPromote
                            )
                    }
                }

                if (collectorState === 'promoGroup' || active === 'promoGroup') {
                    // this section checks all units
                    if(collectorState === 'cancelPromo') {
                        i.update(' ');
                        partyFunction('You did not promote any units.');
                        partyCollector.stop('Promo Cancel');
                        return;
                    }
                    else if(shortList[unitChoice]?.promos === undefined) {
                        i.update(' ');
                        partyFunction('These units are at their maximum promotion!');
                        partyCollector.stop('Units Maxed');
                        return;
                    }
                    else if (shortList[unitChoice]?.promos === 0) {
                        i.update(' ');
                        partyFunction('These units do not have enough experience, train your units!');
                        partyCollector.stop('Units not promotable');
                        return;
                    }
                    active = 'promoGroup';
                    // collectorState is set to any button clicks and select menu, it has multiple jobs
                    // active variable is "real" check for what to do on second, third, etc runs
                    if(collectorState !== 'promoGroup') {
                        promoChoice = collectorState;
                    }

                    if (!firstPromo) { // this section checks individual units
                        if(tempGold < promoCost) {
                            i.update('Loading...');
                            partyFunction(`You do not have enough gold to promote a [${shortList[unitChoice].name}], earn some gold!`);
                            partyCollector.stop('Not Enough Gold');
                            return;
                        }
                        tempGold -= promoCost;
                        await promoteUnit(user, promoUnits[promoCounter - 1], promoChoice, party.party, promoCost);
                        promoCounter--;
                        if(promoCounter === 0) {
                            i.update('Loading...');
                            partyFunction(`You do not have another promotable [${shortList[unitChoice].name}], train your units!`);
                            //collectorState = null; <-- not needed
                            partyCollector.stop('Units Promoted');
                            return;
                        }
                    }

                    const unitType = Object.keys(party.shortList()).find(unitType => unitType === unitChoice);

                    await promote(shortList[unitType]);
                    i.update({
                        content: promoMsg,
                        embeds: [promoGroupEmbed],
                        components: [promoOptionsRow, promoCancelRow]
                    });
                    promoMsg = `${shortList[unitType].name} has been promoted to I2 ${promoChoice}`; //fix this
                }

                const dismiss = async (typeData) => {
                    dismissGroupEmbed
                        .setTitle(`Select the amount of [${typeData.name}] to dismiss from your party.\nRemaining: ${typeData.amt}`)
    
                    dismissSelect
                        .setCustomId('amt')
                        .setPlaceholder('How many units do you want to dismiss?')

                    const dismissOptions = typeData.amt <= 25 ? typeData.amt : 25;
                    for (let i = 0; i <= dismissOptions; i++) {
                        if(i === 0) {
                            dismissSelect.addOptions(
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('Cancel')
                                    .setValue(`${i}`)
                            )
                        }
                        else {
                            dismissSelect.addOptions(
                                new StringSelectMenuOptionBuilder()
                                    .setLabel(`${i}`)
                                    .setValue(`${i}`)
                            )
                        }
                    }
    
                    dismissSelectRow
                        .addComponents(
                            dismissSelect
                        )

                    canDismiss = true;
                }
    
                if (collectorState === 'dismissGroup' || active === 'dismissGroup') {
                    if(collectorState !== 'dismissGroup') {
                        dismissChoice = collectorState;
                    }
                    active = 'dismissGroup';

                    if(canDismiss) {
                        dismissMsg = `You have dismissed ${dismissChoice} [${unitChoice}]`;
                        i.update('Loading...');
                        await dismissUnits(user, unitChoice, dismissChoice, party.party);
                        partyFunction(dismissMsg);
                        partyCollector.stop('Units Dismissed');
                        return;
                    }

                    const unitType = Object.keys(party.shortList()).find(unitType => unitType === unitChoice);

                    await dismiss(shortList[unitType]);
                    i.update({
                        content: dismissMsg,
                        embeds: [dismissGroupEmbed],
                        components: [dismissSelectRow]
                    })
                }
            })

            partyCollector.on('end', async (collected, reason) => {
                if(timeout) { // copy gear for how to timeout properly? (half complete, finish as party is developed)
                    const timeoutEmbed = new EmbedBuilder().setTitle("Your party is bored of staring at you.");
                    setActive(user.id, false);
                    await interaction.editReply({
                      content: "",
                      embeds: [timeoutEmbed],
                      components: [],
                    });
                }
            })
            
        }
    }
}