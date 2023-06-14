const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { clearInv } = require("../../../backend/firestore/utility/clear_inv");

const adminClearInv = async (user, interaction) => {
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
      const result = await clearInv(targetUser);
      if (result) {
        return interaction.editReply({
          content: `Cleared ${targetUser} inventory.`,
          components: [],
        });
      }
      else {
        return interaction.editReply({
          content: `Cannot clear ${targetUser} inventory. Firestore Error.`,
          components: [],
        });
      }
    }
    else if (i.customId === "deny") {
      return interaction.editReply({
        content: `${targetUser} inventory NOT cleared.`,
        components: [],
      });
    }

    collector.stop("no timeout");
  });

  collector.on("end", (collected, reason) => {
    if (timeout) {
      return interaction.editReply({
        content: `${targetUser} inventory NOT cleared due to timeout`,
        components: []
      });
    }
  });
};

module.exports = { adminClearInv };
