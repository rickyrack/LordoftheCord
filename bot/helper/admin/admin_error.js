const adminError = async (errorMsg, interaction) => {
    return interaction.reply(errorMsg);
}

module.exports = { adminError };