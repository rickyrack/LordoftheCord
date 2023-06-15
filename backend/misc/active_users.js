const { EmbedBuilder } = require("discord.js");
const { getUser } = require("../firestore/utility/get_user");
const { userCheck } = require("../firestore/utility/user_check");

const activeUsers = new Map();

const doubleCommandEmbed = new EmbedBuilder()
    .setTitle('You cannot have two commands open at once.\nClose the previous command or wait for the timer.');

const checkActive = async (interaction) => {
    const user = interaction.user;
        console.log(activeUsers.get(user.id))
        if (activeUsers.get(user.id)) {
            console.log('early reply');
        await interaction.reply({ embeds: [doubleCommandEmbed] });
        return 'active user';
        }
        console.log(`${user.id} is inactive`);
}

const setActive = (userID, userActive) => activeUsers.set(userID, userActive);

const useCommand = async (interaction) => {
    const user = interaction.user;

    if(await checkActive(interaction) === 'active user');

    if(!await userCheck(user)) return interaction.reply('Try /start to enter Discordia!');

    const userData = await getUser(user);
    console.log(userData);

    setActive(user.id, true);

    console.log(activeUsers);
    return { user, userData };
}

module.exports = { useCommand, checkActive, setActive };