const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { Party } = require("../../helper/models/PartyClass");
const { useCommand } = require("../../../backend/misc/active_users");
const { getUser } = require("../../../backend/firestore/utility/get_user");

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

        console.log(party.textSummary());

            const noParty = party.length() === 0 ? true : false;

            if (noParty) {
              unitString = 'You have no party members!'
            }
    
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
                    components: [/*partySelectRow, */promoRow, dismissRow, disbandRow]
                });
            }
            else {
                message = await interaction.editReply({
                    content: '',
                    embeds: [partyMsg, partyEmbed],
                    components: [/*partySelectRow, */promoRow, dismissRow, disbandRow]
                });
            }
        }
    }
}