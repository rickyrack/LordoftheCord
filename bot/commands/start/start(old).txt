const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder } = require('discord.js');
const { start } = require('../../../backend/firestore/start/start');
const { userCheck } = require('../../../backend/firestore/utility/user_check');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Enter the wasteland...'),
	async execute(interaction) {
		const user = interaction.user;

		if(await userCheck(user)) {
			return interaction.reply('You cannot "/start" again, try /explore.')
		}

		await start(user);

        const startEmbed = new EmbedBuilder()
            .setTitle("Cord Exodus")
            .setDescription("You're in the wasteland, try /explore")
            .setImage("https://i.imgur.com/OgIlXd9.png")
		return interaction.reply({ embeds: [startEmbed] });
	},
};