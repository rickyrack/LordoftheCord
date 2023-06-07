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
const { useItem } = require("../../../backend/firestore/utility/use_item");
const { updateEquipped } = require("../../../backend/firestore/utility/update_equipped");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gear")
    .setDescription("Look at your gear."),
  async execute(interaction) {
    const user = interaction.user;

    if (!(await userCheck(user))) {
      return interaction.reply("Try /start to enter Discordia!");
    }

    let firstOpen = true;

    await gearFunction();
    async function gearFunction(gearDesc) {
      const userData = await getUser(user);

      await updateEquipped(user, userData);

      console.log(userData.gear);

      Object.keys(userData.gear).forEach((itemID) => {
        if (userData.gear[itemID].quantity === 0) delete userData.gear[itemID];
      });
      const noGear = Object.keys(userData.gear).length === 0 ? true : false;

      if (noGear) {
        const noGearEmbed = new EmbedBuilder()
          .setTitle("⚔️ 🏹 Gear 🍗 🛡️")
          .setDescription("Try /explore to find some gear.")
          .addFields({
            name: "You have no gear!",
            value: " ",
          });
        return interaction.reply({
          embeds: [noGearEmbed],
        });
      }

      const maxGearValues = Object.keys(userData.gear).length;
      const gearSelect = new StringSelectMenuBuilder()
        .setCustomId("item")
        .setPlaceholder("No Item Selected")
        .setMinValues(1)
        .setMaxValues(maxGearValues);

      // creates gear string containing ALL of the user's gear
      let gearString = "";
      Object.keys(userData.gear).forEach((itemID) => {
        gearString += `[${
          userData.gear[itemID].quantity > 9
            ? userData.gear[itemID].quantity
            : "0" + userData.gear[itemID].quantity
        }] ${userData.gear[itemID].name} ${
          userData.gear[itemID]?.emoji ? userData.gear[itemID]?.emoji : " "
        }\n`;
        gearSelect.addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel(
              `[${
                userData.gear[itemID].quantity > 9
                  ? userData.gear[itemID].quantity
                  : "0" + userData.gear[itemID].quantity
              }] ${userData.gear[itemID].name} ${
                userData.gear[itemID]?.emoji
                  ? userData.gear[itemID]?.emoji
                  : " "
              }`
            )
            .setDescription(
              "This is based on type of item, ex: food gets morale, weapons get damage etc"
            )
            .setValue(`${itemID}`)
        );
      });

      // creates "equipped" string for gear embed
      let equippedString = "";
      let equippedOrder = {
        armor: "",
        equipped: "",
        amulet: "",
      };

      // DO NOT CHANGE SPACING OF LINES(affects embed spacing)
      Object.keys(userData.equipped).forEach((type) => {
        console.log(type);
        if (type === "armor") {
          equippedOrder.armor = `\nHead: ${
            userData.gear[userData.equipped.armor.head]?.name || "None"
          } ${userData.gear[userData.equipped.armor.head]?.emoji || ""}\nBody: ${
            userData.gear[userData.equipped.armor.body]?.name || "None"
          } ${userData.gear[userData.equipped.armor.body]?.emoji || ""}\nLegs: ${
            userData.gear[userData.equipped.armor.legs]?.name || "None"
          } ${userData.gear[userData.equipped.armor.legs]?.emoji || ""}\n`;
        } else if (type === "hand") {
          equippedOrder.equipped = `\nEquipped:\n${
            userData.gear[userData.equipped.hand?.[1]]?.name || "None"
          } ${userData.gear[userData.equipped.hand?.[1]]?.emoji || ""}\n${userData.gear[userData.equipped.hand?.[2]]?.name || "None"} ${userData.gear[userData.equipped.hand?.[2]]?.emoji || ""}\n${
            userData.gear[userData.equipped.hand?.[3]]?.name || "None"
          } ${userData.gear[userData.equipped.hand?.[3]]?.emoji || ""}\n${userData.gear[userData.equipped.hand?.[4]]?.name || "None"} ${userData.gear[userData.equipped.hand?.[4]]?.emoji || ""}\n`;
        } else if (type === "amulet") {
          equippedOrder.amulet = `\nAmulet:\n${
            userData.gear[userData.equipped?.amulet]?.name ||
            "None"
          } ${userData.gear[userData.equipped?.amulet]?.emoji || ""}`;
        }
      });
      equippedString = `Armor:${equippedOrder.armor}${equippedOrder.equipped}${equippedOrder.amulet}`;

      gearSelect.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Close Gear")
          .setValue("close")
      );

      // gear selection selection menu
      const row1 = new ActionRowBuilder().addComponents(gearSelect);

      const gearEmbed = new EmbedBuilder()
        .setTitle("⚔️ 🏹 Gear 🍗 🛡️")
        .addFields(
          { name: `${gearString}`, value: " ", inline: true },
          { name: `${equippedString}`, value: " ", inline: true }
        );

      let message;

      if (firstOpen) {
        firstOpen = false;
        message = await interaction.reply({
          content: "",
          embeds: [gearEmbed],
          components: [row1],
        });
      } else {
        gearEmbed.setDescription(gearDesc);
        message = await interaction.editReply({
          content: "",
          embeds: [gearEmbed],
          components: [row1],
        });
      }

      const gearFilter = (i) => {
        return i.user.id === user.id;
      };

      const gearCollector = message.createMessageComponentCollector({
        filter: gearFilter,
        time: 60000,
      });

      const timeoutEmbed = new EmbedBuilder().setTitle("Your gear got bored.");
      const closeEmbed = new EmbedBuilder().setTitle(
        "You stopped looking at your gear."
      );

      let gearChoices = "";
      let itemUsed = false;
      let timeout = true;
      let activeWeapPrompt = false;
      let activeWeapSlot = null;
      let activeWeapChoice = null;
      gearCollector.on("collect", async (selectInt) => {
        timeout = false;
        gearChoices = selectInt.values;

        // uses same collector for active weapon selection
        if (activeWeapPrompt === true) {
          gearChoices = "";
          itemUsed = false;
          timeout = true;
          activeWeapPrompt = false;
          await selectInt.update({
            content: "Loading...",
          });
          activeWeapSlot = selectInt.customId;
          itemUsed = await useItem(
            user,
            userData,
            activeWeapChoice,
            activeWeapSlot
          )
          activeWeapSlot = null;
          activeWeapChoice = null;
          gearCollector.stop('loading');
          return await gearFunction('test'); 
        }

        if (gearChoices[0] === "close") {
          return interaction.editReply({
            content: "",
            embeds: [closeEmbed],
            components: [],
          });
        }

        console.log(gearChoices);
        console.log(userData.gear[gearChoices[0]]);

        let desc = "";

        if (gearChoices.length === 1 && !activeWeapPrompt) {
          switch (userData.gear[gearChoices[0]].type) {
            case "food":
              console.log("food");
              itemUsed = await useItem(
                user,
                userData,
                userData.gear[gearChoices[0]]
              );
              desc = `Your party will consume ${
                userData.gear[gearChoices[0]].name
              }s first.`;
              break;
            case "weapons":
              console.log("weapons");
              const activeWeaponsEmbed = new EmbedBuilder()
                .setTitle('Select a weapon slot to replace.')
              const activeWeaponsRow = new ActionRowBuilder()
              for (let i = 0; i < 4; i++) {
                const itemID = userData.equipped.hand[i+1];
                activeWeaponsRow.addComponents(
                new ButtonBuilder()
                  .setCustomId(`${i+1}`)
                  .setLabel(userData.gear?.[itemID].name || `Slot ${i+1}`)
                  .setStyle(ButtonStyle.Secondary)
                );
              }
              await selectInt.update({
                embeds: [activeWeaponsEmbed],
                components: [activeWeaponsRow]
              })
              activeWeapPrompt = true;
              activeWeapChoice = userData.gear[gearChoices[0]];
              break;
            case "misc":
              console.log("misc");
              break;
            default:
              console.log("ERROR: Item type does not exist.");
              break;
          }

          if (itemUsed && !activeWeapPrompt) {
            await selectInt.update({
              content: "Loading...",
            });
            gearCollector.stop();
            await gearFunction(desc); // put this in end collector i think?
          }
        }
      });

      gearCollector.on("end", async (collected, reason) => {
        if(reason === 'loading') {
          await interaction.editReply({
            content: "Loading...",
            embeds: [],
            components: [],
          });
        }
        else if (timeout) {
          await interaction.editReply({
            content: "",
            embeds: [timeoutEmbed],
            components: [],
          });
        }
      });
    }
  },
};
