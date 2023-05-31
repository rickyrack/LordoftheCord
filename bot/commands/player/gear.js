const { EmbedBuilder } = require("@discordjs/builders");
const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");
const { userCheck } = require("../../../backend/firestore/utility/user_check");
const { getUser } = require("../../../backend/firestore/utility/get_user");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gear")
    .setDescription("Look at your gear."),
  async execute(interaction) {
    const user = interaction.user;

    if (!(await userCheck(user))) {
      return interaction.reply("Try /start to enter Discordia!");
    }

    const userData = await getUser(user);

    console.log(userData.gear);

    const gearSelect = new StringSelectMenuBuilder()
      .setCustomId("item")
      .setPlaceholder("No Item Selected");

    let gearString = "";

    Object.keys(userData.gear).forEach((itemID) => {
      gearString += `[${
        userData.gear[itemID].quantity > 9
          ? userData.gear[itemID].quantity
          : "0" + userData.gear[itemID].quantity
      }] ${userData.gear[itemID].name} ${userData.gear[itemID]?.emoji ? userData.gear[itemID]?.emoji : ' '}\n`;
      gearSelect.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(
            `[${
              userData.gear[itemID].quantity > 9
                ? userData.gear[itemID].quantity
                : "0" + userData.gear[itemID].quantity
            }] ${userData.gear[itemID].name} ${userData.gear[itemID]?.emoji ? userData.gear[itemID]?.emoji : ' '}`
          )
          .setDescription("This is based on type of item, ex: food gets morale, weapons get damage etc")
          .setValue(`${userData.gear[itemID].id}`)
      );
    });

    // gear selection selection menu
    const row1 = new ActionRowBuilder().addComponents(gearSelect);

    const gearEmbed = new EmbedBuilder()
      .setTitle("⚔️ 🏹 Gear 🍗 🛡️")
      .addFields({
        name: `${gearString}`,
        value: " ",
      });

    return interaction.reply({
      embeds: [gearEmbed],
      components: [row1],
    });
  },
};
