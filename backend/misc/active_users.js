const { EmbedBuilder } = require("discord.js");
const { getUser } = require("../firestore/utility/get_user");
const { userCheck } = require("../firestore/utility/user_check");

const activeUsers = new Map();

const doubleCommandEmbed = new EmbedBuilder()
    .setTitle('You cannot have two commands in use at once.\nClose the previous command or wait for the timer.');

const checkActive = async (interaction) => {
    const user = interaction.user;
        if (activeUsers.get(user.id)) {
            await interaction.reply({ embeds: [doubleCommandEmbed] });
            return true;
        }
}

const setActive = (userID, userActive) => activeUsers.set(userID, userActive);

const useCommand = async (interaction, skipUserData) => {
    const user = interaction.user;

    const closeCommand = await checkActive(interaction);

    if(!await userCheck(user)) return interaction.reply('Try /start to enter Discordia!');

    let userData = {};

    if (!skipUserData) {
        userData = await getUser(user);
    }

    if (closeCommand) userData.closeCommand = true;

    setActive(user.id, true);

    return { user, userData };
}

module.exports = { useCommand, checkActive, setActive };

        // OLD WAY OF STARTING MOST COMMANDS FOR REFERENCE
		/*const user = interaction.user;

		if(!await userCheck(user)) {
			return interaction.reply('Try /start to enter Discordia!');
		}

        const userData = await getUser(user);*/