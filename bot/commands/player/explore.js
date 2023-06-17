const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder } = require('discord.js');
const { explore } = require('../../../backend/firestore/player/explore');
const { getTile } = require('../../helper/locations/get_tile');
const { useCommand } = require('../../../backend/misc/active_users');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('explore')
		.setDescription('Explore the area.'),
	async execute(interaction) {
		interaction.deferReply();
        const { user, userData } = await useCommand(interaction); if (userData.closeCommand) return;

        const tile = getTile(userData);

        const itemsFound = await explore(userData, user);
		
		if(!itemsFound) {
			const noExploreEmbed = new EmbedBuilder()
				.setTitle('Your party does not have enough morale to explore.')
				.setDescription('Try setting up camp, visiting a town or winning a battle.');
		
			return interaction.reply({ embeds: [noExploreEmbed] });
		}

		let itemsString = '';

		itemsFound.forEach(item => {
			itemsString += `[1] ${item}\n`
		})
		console.log(itemsString);
		console.log(tile);

        const exploreEmbed = new EmbedBuilder()
            .setTitle(`You explore the ${tile.type}`)
            .setImage('https://i.imgur.com/G6AEA2T.png');

			exploreEmbed.addFields({
				name: 'Your exploring payed off, you found:', value: `${itemsString}`
			})

		setActive(user.id, false);
		return interaction.editReply({ embeds: [exploreEmbed] });
	},
};