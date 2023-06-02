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

    console.log(userData.gear);

    Object.keys(userData.gear).forEach(itemID => {
      if(userData.gear[itemID].quantity === 0) delete userData.gear[itemID];
    })
    const noGear = Object.keys(userData.gear).length === 0
      ? true
      : false;

    if(noGear) {
      const noGearEmbed = new EmbedBuilder()
      .setTitle("⚔️ 🏹 Gear 🍗 🛡️")
      .setDescription('Try /explore to find some gear.')
      .addFields({
        name: 'You have no gear!',
        value: " ",
      });
      return interaction.reply({
        embeds: [noGearEmbed]
      });
    }

    const maxGearValues = Object.keys(userData.gear).length;
    const gearSelect = new StringSelectMenuBuilder()
      .setCustomId("item")
      .setPlaceholder("No Item Selected")
      .setMinValues(1)
      .setMaxValues(maxGearValues);

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

    gearSelect.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Close Gear')
        .setValue('close')
    );

    // gear selection selection menu
    const row1 = new ActionRowBuilder().addComponents(gearSelect);

    const gearEmbed = new EmbedBuilder()
      .setTitle("⚔️ 🏹 Gear 🍗 🛡️")
      .addFields({
        name: `${gearString}`,
        value: " ",
      });

    let message;

    if(firstOpen) {
      firstOpen = false;
      message = await interaction.reply({
        content: '',
        embeds: [gearEmbed],
        components: [row1],
      });
    }
    else {
      gearEmbed.setDescription(gearDesc);
      message = await interaction.editReply({
        content: '',
        embeds: [gearEmbed],
        components: [row1],
      });
    }

    const gearFilter = i => {
      return i.user.id === user.id
    }

    const gearCollector = message.createMessageComponentCollector({
      filter: gearFilter,
      time: 60000
    });

    
    const timeoutEmbed = new EmbedBuilder().setTitle("Your gear got bored.");
    const closeEmbed = new EmbedBuilder().setTitle("You stopped looking at your gear.");

    let gearChoices = '';
    let itemUsed = false;
    let timeout = true;
    gearCollector.on('collect', async (selectInt) => {
      timeout = false;
      gearChoices = selectInt.values;

      if(gearChoices[0] === 'close') {
        return interaction.editReply({
          content: '',
          embeds: [closeEmbed],
          components: []
        })
      }

      console.log(gearChoices);
      console.log(userData.gear[gearChoices[0]]);

      let desc = '';

      if(gearChoices.length === 1) {
        switch (userData.gear[gearChoices[0]].type) {
          case 'food':
            console.log('food')
            itemUsed = await useItem(user, userData, userData.gear[gearChoices[0]].id);
            desc = `Your party will consume ${userData.gear[gearChoices[0]].name}s first.`;
            break;
          case 'weapons':
            console.log('weapons')
            break;
          case 'misc':
            console.log('misc')
            break;
          default:
            console.log('ERROR: Item type does not exist.')
            break;
        }

        if(itemUsed) {
          await selectInt.update({
            content: 'Loading...'
          });
          await gearFunction(desc); // put this in end collector i think?
        }
      }
    })

    gearCollector.on('end', async (collected, reason) => {
      if(timeout) {
        await interaction.editReply({
          content: '',
          embeds: [timeoutEmbed],
          components: []
        })
      }
    })
  }
  },
};
