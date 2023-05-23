const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { userCheck } = require('../../../backend/firestore/utility/user_check');
const { getUser } = require('../../../backend/firestore/utility/get_user');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('map')
		.setDescription('map TEST'),
	async execute(interaction) {
        const user = interaction.user;

		if(!await userCheck(user)) {
			return interaction.reply('Try /start to enter Discordia!')
		}

        const userData = await getUser(user);

        let mapData = require('../../../backend/map/map.json');
        mapData = mapData.map;
        let tileSet = require('../../../backend/map/tile_set.json');

        const travelMap = [];

        for (let i = 0; i < 9; i++) {
            const column = [];
            const x = userData.location.x - 4 + i;
            for(let i = 0; i < 9; i++) {
                const y = userData.location.y - 4 + i;
                column.push(mapData[x][y])
            }
            travelMap.push(column);
        }

        let displayMap = '';
        let footer = {
            location: '',
            iconURL: ''
        }

        for (let h = 0; h < 9; h++) {
            for (let w = 0; w < 9; w++) {
                const tile = travelMap[w][h];
                if(tile.coords[0] === userData.location.x &&
                    tile.coords[1] === userData.location.y) {
                        displayMap += tileSet['Player'].emojis;
                        footer.location = tile.type;
                        footer.iconURL = tileSet[tile.type].iconURL;
                    }
                    else {
                        displayMap += tileSet[tile.type].emojis;
                    }
            }
            displayMap += '\n';
        }

        const mapEmbed = new EmbedBuilder()
        .setTitle('World Map')
        .setDescription(displayMap)
        .setThumbnail('https://i.imgur.com/VJRI1K9.png') // add the canvas show party location
        .setFooter({ text: `You are in: ${footer.location}`, iconURL: `${footer.iconURL}` })

		return interaction.reply({ embeds: [mapEmbed] });
	},
};