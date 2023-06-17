const { SlashCommandBuilder } = require("discord.js");
const {
  adminCheck,
} = require("../../../backend/firestore/utility/admin_check");
const { userCheck } = require("../../../backend/firestore/utility/user_check");
const { addItem } = require("../../../backend/firestore/utility/add_item");
const { adminGive } = require("../../helper/admin/give");
const { adminClearInv } = require("../../helper/admin/clear_inv");
const { adminRecruit } = require("../../helper/admin/recruit");
const { adminClearParty } = require("../../helper/admin/clear_party");
const { adminError } = require("../../helper/admin/admin_error");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("god")
    .setDescription("Do not mess with the church!.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("clear")
        .setDescription("Clear a user's inventory or party.")
        .addStringOption((option) =>
          option
            .setName("field")
            .setDescription("Field to clear. Options: inv, party")
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User this command is applied to.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("give")
        .setDescription("Add to a user's inventory.")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User to give an item to.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("itemid")
            .setDescription("ID of the resource.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("recruit")
        .setDescription("Add units to a user's inventory.")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User to give units to.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("unitid")
            .setDescription("ID of the unit.")
            .setRequired(true)
        )
        .addStringOption((option) =>
        option
          .setName("amount")
          .setDescription("Amount of the unit to add.")
          .setRequired(true)
      )
    ),
  async execute(interaction) {
    const user = interaction.user;

    if (!(await userCheck(user))) {
      return interaction.reply("You do not exist.");
    }

    if (!(await adminCheck(user))) {
      return interaction.reply("Heresy! (You're not a priest)");
    }

    if (interaction.options.getSubcommand() === "give") {
      await adminGive(user, interaction);
    } else if (interaction.options.getSubcommand() === "clear") {
      const clearField = interaction.options.getString("field");
      switch (clearField) {
        case "inv":
          await adminClearInv(user, interaction);
          break;
        case "party":
          await adminClearParty(user, interaction);
          break;
        default:
          const errorMsg = "God Command Error: Field to clear does not exist.";
          console.log("God Command Error: Field to clear does not exist.");
          adminError(errorMsg, interaction);
          break;
      }

    } else if (interaction.options.getSubcommand() === "recruit") {
      await adminRecruit(user, interaction);
    }
  },
};
