const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { userCheck } = require('../../../backend/firestore/utility/user_check');
const { getUser } = require('../../../backend/firestore/utility/get_user');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gear')
		.setDescription('Look at your gear.'),
	async execute(interaction) {
		const user = interaction.user;

		if(!await userCheck(user)) {
			return interaction.reply('Try /start to enter Discordia!')
		}

        const userData = await getUser(user);

		console.log(userData.gear);

		let gearString = '';

		let itemCounter = 0;
		Object.keys(userData.gear).forEach(item => {
			itemCounter++;
			gearString += `(${itemCounter}) [${userData.gear[item].quantity}] ${userData.gear[item].name}\n`
		});

				// gear selection buttons
				const row1 = new ActionRowBuilder();
				const row2 = new ActionRowBuilder();
				const row3 = new ActionRowBuilder();
		
				let rowCounter = 1;
				let currentRow = row1;
		
				for (let i = 1; i < itemCounter + 1; i++) {
					switch (rowCounter) {
						case 6:
							currentRow = row2;
							break;
						case 11:
							currentRow = row3;
								break;
						default:
							break;
					}
					currentRow.addComponents(
						new ButtonBuilder()
							.setCustomId(`${i}`)
							.setLabel(`Item (${i})`)
							.setStyle(ButtonStyle.Secondary)
						)
					rowCounter++;
				}

		const gearEmbed = new EmbedBuilder()
			.setTitle('⚔️ 🏹 Gear 🍗 🛡️')
			.addFields({
				name: `${gearString}`, value: ' '
				});

		// sets how many button rows to show
		const showButtons = itemCounter > 10
		? [row1, row2, row3]
		: itemCounter > 5
			? [row1, row2]
			: [row1];

		console.log(row1);
		return interaction.reply({
			embeds: [gearEmbed],
			components: showButtons
		});
	},
};