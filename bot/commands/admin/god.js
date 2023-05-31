const { SlashCommandBuilder } = require("discord.js");
const {
  adminCheck,
} = require("../../../backend/firestore/utility/admin_check");
const { userCheck } = require("../../../backend/firestore/utility/user_check");
const { addItem } = require("../../../backend/firestore/utility/add_item");
const { adminGive } = require("../../helper/admin/give");
const { adminClearInv } = require("../../helper/admin/clear_inv");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("god")
    .setDescription("Do not mess with the church!.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("empty")
        .setDescription("Clear a user's inventory.")
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription("User who's inventory you want to edit.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("give")
        .setDescription("Clear a user's inventory.")
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('User to give an item to.')
                .setRequired(true))
        .addStringOption(option => 
            option
                .setName('itemid')
                .setDescription('ID of the resource.')
                .setRequired(true))),
  async execute(interaction) {
    const user = interaction.user;

    if (!(await userCheck(user))) {
      return interaction.reply("You do not exist.");
    }

    if (!(await adminCheck(user))) {
      return interaction.reply("Heresy! (You're not a priest)");
    }

    if(interaction.options.getSubcommand() === 'give') {
        await adminGive(user, interaction);
    }
    else if(interaction.options.getSubcommand() === 'empty') {
        await adminClearInv(user, interaction);
    }
  },
};
