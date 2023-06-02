const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder } = require('discord.js');
const { start } = require('../../../backend/firestore/start/start');
const { userCheck } = require('../../../backend/firestore/utility/user_check');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Enter Discordia'),
	async execute(interaction) {
		const user = interaction.user;

		if(await userCheck(user)) {
			return interaction.reply('You cannot "/start" again, try /test.')
		}

		await start(user);

        const startEmbed = new EmbedBuilder()
            .setTitle("Welcome to Discordia!")
            .setDescription("Try /TEST")
            .setImage("https://i.imgur.com/KX845iF.jpg");

		return interaction.reply({ embeds: [startEmbed] });
	},
};