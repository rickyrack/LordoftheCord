const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder } = require('discord.js');
const { userCheck } = require('../../../backend/firestore/utility/user_check');
const { getTile } = require('../../../backend/firestore/utility/get_tile');
const { explore } = require('../../../backend/firestore/player/explore');
const { getUser } = require('../../../backend/firestore/utility/get_user');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('explore')
		.setDescription('Explore the area.'),
	async execute(interaction) {
		const user = interaction.user;

		if(!await userCheck(user)) {
			return interaction.reply('Try /start to enter Discordia!')
		}

        const userData = await getUser(user);

        const tile = getTile(userData);

        const itemsFound = await explore(userData, user);

		let itemsString = '';

		itemsFound.forEach(item => {
			itemsString += `(1) ${item}\n`
		})

        const exploreEmbed = new EmbedBuilder()
            .setTitle(`You explore the ${tile.type}`)
            .setImage('https://i.imgur.com/G6AEA2T.png');

			exploreEmbed.addFields({
				name: 'Your exploring payed off, you found:', value: `${itemsString}`
			})

		return interaction.reply({ embeds: [exploreEmbed] });
	},
};