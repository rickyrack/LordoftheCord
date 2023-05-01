const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		let message = await interaction.reply('Pong!');
		message = await interaction.fetchReply();

		const collectorFilter = (reaction, user) => {
			return true;//reaction.emoji.name === '👍' && user.id === message.author.id;
		};
		
		const collector = message.createReactionCollector({ time: 15000 });
		
		collector.on('collect', (reaction, user) => {
			console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
		});
		
		collector.on('end', collected => {
			console.log(`Collected ${collected.size} items`);
		});
	},
};