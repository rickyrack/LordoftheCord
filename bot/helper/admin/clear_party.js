const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { clearParty } = require("../../../backend/firestore/utility/clear_party");

const adminClearParty = async (user, interaction) => {
  const targetUser = interaction.options.getUser("user");

  const confirmButton = new ButtonBuilder()
    .setCustomId("confirm")
    .setLabel("Confirm")
    .setStyle(ButtonStyle.Success);
  const denyButton = new ButtonBuilder()
    .setCustomId("deny")
    .setLabel("Deny")
    .setStyle(ButtonStyle.Danger);

  const row1 = new ActionRowBuilder().addComponents(confirmButton, denyButton);

  let message;

  message = await interaction.reply({
    content: `Are you sure you want to clear ${targetUser}'s party?`,
    components: [row1],
  });

  const filter = (i) => {
    return i.user.id === user.id;
  };

  const collector = message.createMessageComponentCollector({
    filter: filter,
    time: 10000,
  });

  let timeout = true;
  collector.on("collect", async (i) => {
    timeout = false;
    if (i.customId === "confirm") {
      const result = await clearParty(targetUser);
      if (result) {
        return interaction.editReply({
          content: `Cleared ${targetUser} party.`,
          components: [],
        });
      }
      else {
        return interaction.editReply({
          content: `Cannot clear ${targetUser} party. Firestore Error.`,
          components: [],
        });
      }
    }
    else if (i.customId === "deny") {
      return interaction.editReply({
        content: `${targetUser} party NOT cleared.`,
        components: [],
      });
    }

    collector.stop("no timeout");
  });

  collector.on("end", (collected, reason) => {
    if (timeout) {
      return interaction.editReply({
        content: `${targetUser} party NOT cleared due to timeout`,
        components: []
      });
    }
  });
};

module.exports = { adminClearParty };
