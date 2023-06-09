const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require("discord.js");
const { Party } = require("../../helper/models/PartyClass");
const { useCommand, setActive } = require("../../../backend/misc/active_users");
const { getUser } = require("../../../backend/firestore/utility/get_user");
const { promoteUnit } = require("../../../backend/firestore/utility/promote_unit");

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
                .setDescription(`Morale: ${userData.stats.morale}\nParty Size: ${party.length()}/${party.maxSize()} units`)
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
            //let maxPromotion = 0;
            let promoGroupEmbed = new EmbedBuilder();
            let promoOptionsRow = new ActionRowBuilder();
            let active = null;
            let promoChoice = '';
            let promoTypes = [];
            let firstPromo = true;
            let promoMsg = ' ';
            //let promoMsgNameHolder = '';
            let promoCounter = 0;
            let promoUnits = [];
            let maxPromo = false;
            let tempGold = 0;
            let timeout = true;
            partyCollector.on('collect', async i => {
                let intType = i.customId !== 'unit'
                ? 'button'
                : 'selectMenu';

                if (intType === 'selectMenu') {
                    unitChoice = i.values[0];
                    i.deferUpdate();
                    //partyCollector.stop('Unit Type Selected');
                    //return;
                }

                collectorState = i.customId;

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
                    i.update(' '); //i.update('Loading...'); "loading was sometimes staying on screen, temp fix"
                    partyFunction('You must select a unit first!');
                    collectorState = null;
                    partyCollector.stop('No Unit Type Selected');
                    return;
                }

                const promote = async (typeData) => {
                    promoGroupEmbed
                        .setTitle(`Select a promotion for each [${typeData.name}].`)
                        .setDescription(`Auto promote will use the [${typeData.class}] tree for all remaining units.`)

                    const autoPromote = new ButtonBuilder()
                        .setCustomId('auto')
                        .setLabel('Auto')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true)

                    const promoButtons = [];
                    if(firstPromo) {
                        tempGold = userData.stats.gold;
                        console.log(userData.stats)
                        console.log(tempGold)
                        firstPromo = false;
                        promoUnits = party.promoAvailable(typeData.type);
                        promoCounter = promoUnits.length;
                        promoTypes = await party.getPromoTypes(typeData);
                        console.log('first')
                        console.log(promoTypes)
                        promoTypes.forEach(unitType => {
                            promoButtons.push(
                                new ButtonBuilder()
                                    .setCustomId(`${unitType.id}`)
                                    .setLabel(`${unitType.name}`)
                                    .setStyle(ButtonStyle.Success)
                            )
                        })
    
                        promoButtons.push(autoPromote);

                            promoOptionsRow
                            .addComponents(
                                promoButtons
                            )
                    }
                }

                if (collectorState === 'promoGroup' || active === 'promoGroup') {
                    console.log(shortList[unitChoice])
                    if(shortList[unitChoice]?.promos === undefined) {
                        console.log('max')
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

                    if (!firstPromo) {
                        console.log('look')
                        console.log(promoUnits[promoCounter - 1])
                        const promoCost = party.getUnitPromoCost(promoUnits[promoCounter - 1])
                        tempGold -= promoCost;
                        console.log(`tempGold ${tempGold} promoCost ${promoCost}`)
                        if(tempGold < promoCost) {
                            i.update('Loading...');
                            partyFunction(`You do not have enough gold to promote [${shortList[unitChoice].name}], earn some gold!`);
                            partyCollector.stop('Not Enough Gold');
                            return;
                        }
                        console.log(`tempGold: ${tempGold}`);
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
                        components: [promoOptionsRow]
                    });
                    promoMsg = `${shortList[unitType].name} has been promoted to I2 ${promoChoice}`;
                }

            })

            partyCollector.on('end', async (collected, reason) => {
                if(timeout) { // copy gear for how to timeout properly? (half complete, finish as party is developed)
                    const timeoutEmbed = new EmbedBuilder().setTitle("Your party is bored of staring to you.");
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