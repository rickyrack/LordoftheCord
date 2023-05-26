const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const { userCheck } = require("../../../backend/firestore/utility/user_check");
const { getUser } = require("../../../backend/firestore/utility/get_user");
const { move } = require("../../../backend/firestore/player/move");

module.exports = {
  data: new SlashCommandBuilder().setName("map").setDescription("map TEST"),
  async execute(interaction) {
    const user = interaction.user;

    if (!(await userCheck(user))) {
      return interaction.reply("Try /start to enter Discordia!");
    }

    let mapOpen = true;
    let restart = true;
    let firstInt = true;

    const mapOpenCheck = setInterval(() => {
      if (!mapOpen) {
        clearInterval(mapOpenCheck);
      }
      if (restart && mapOpen) {
        restart = false;
        mapFunction();
      }
    }, 1000);

    async function mapFunction() {
      const userData = await getUser(user);

      const mapData = require("../../../backend/map/map.json").map;
      let tileSet = require("../../../backend/map/tile_set.json");

      const travelMap = [];

      for (let i = 0; i < 9; i++) {
        const column = [];
        const x = userData.coords.x - 4 + i;
        for (let i = 0; i < 9; i++) {
          const y = userData.coords.y - 4 + i;
          column.push(mapData[x][y]);
        }
        travelMap.push(column);
      }

      let displayMap = "";
      let footer = {
        location: "",
        iconURL: "",
      };

      for (let h = 0; h < 9; h++) {
        for (let w = 0; w < 9; w++) {
          const tile = travelMap[w][h];
          if (
            tile.coords[0] === userData.coords.x &&
            tile.coords[1] === userData.coords.y
          ) {
            displayMap += tileSet["Player"].emojis;
            footer.location = tile.type;
            footer.iconURL = tileSet[tile.type].iconURL;
          } else {
            displayMap += tileSet[tile.type].emojis;
          }
        }
        displayMap += "\n";
      }

      const mapEmbed = new EmbedBuilder()
        .setTitle("World Map")
        .setDescription(displayMap)
        .setThumbnail("https://i.imgur.com/VJRI1K9.png") // add the canvas show party location
        .setFooter({
          text: `You are in: ${footer.location}`,
          iconURL: `${footer.iconURL}`,
        });

      // movement buttons
      const north = new ButtonBuilder()
        .setCustomId("north")
        .setLabel("North")
        .setStyle(ButtonStyle.Primary);
      const northeast = new ButtonBuilder()
        .setCustomId("northeast")
        .setLabel("North East")
        .setStyle(ButtonStyle.Primary);
      const east = new ButtonBuilder()
        .setCustomId("east")
        .setLabel("East")
        .setStyle(ButtonStyle.Primary);
      const southeast = new ButtonBuilder()
        .setCustomId("southeast")
        .setLabel("South East")
        .setStyle(ButtonStyle.Primary);
      const south = new ButtonBuilder()
        .setCustomId("south")
        .setLabel("South")
        .setStyle(ButtonStyle.Primary);
      const southwest = new ButtonBuilder()
        .setCustomId("southwest")
        .setLabel("South West")
        .setStyle(ButtonStyle.Primary);
      const west = new ButtonBuilder()
        .setCustomId("west")
        .setLabel("West")
        .setStyle(ButtonStyle.Primary);
      const northwest = new ButtonBuilder()
        .setCustomId("northwest")
        .setLabel("North West")
        .setStyle(ButtonStyle.Primary);
      const center = new ButtonBuilder()
        .setCustomId("closemap")
        .setLabel("🧭Close Map 🐉 ")
        .setStyle(ButtonStyle.Secondary);

      const topRow = new ActionRowBuilder().addComponents(
        northwest,
        north,
        northeast
      );
      const middleRow = new ActionRowBuilder().addComponents(
        west,
        center,
        east
      );
      const bottomRow = new ActionRowBuilder().addComponents(
        southwest,
        south,
        southeast
      );

      const loadingEmbed = new EmbedBuilder().setTitle("Loading...");
      const timeoutEmbed = new EmbedBuilder().setTitle("Your map got bored.");
      const closeEmbed = new EmbedBuilder().setTitle("You closed your map.");

      let message;

      if (!firstInt) {
        message = await interaction.editReply({
          embeds: [mapEmbed],
          components: [topRow, middleRow, bottomRow],
        });
      } else {
        firstInt = false;
        message = await interaction.reply({
          embeds: [mapEmbed],
          components: [topRow, middleRow, bottomRow],
        });
      }

      const moveFilter = (i) => {
        return (i.user.id = user.id);
      };

      const moveCollector = message.createMessageComponentCollector({
        filter: moveFilter,
        time: 60000,
      });

      let moveChoice = "";
      moveCollector.on("collect", async (i) => {
        moveChoice = i.customId;
        if (moveChoice === "closemap") {
          mapOpen = false;
          await interaction.editReply({
            embeds: [closeEmbed],
            components: [],
          });
          return;
        }
        await i.update({
          embeds: [mapEmbed, loadingEmbed],
          components: [],
        });

        const moveSuccess = await move(user, moveChoice);
        restart = true;
        // restarts function, should this be in end collector?

        moveCollector.stop("Move Selected");
      });

      moveCollector.on("end", async (collected, reason) => {
        // add timeout and close too?
        if(reason === 'time') {
            mapOpen = false;
            await interaction.editReply({
                embeds: [timeoutEmbed],
                components: []
            })
        }
      });
    }
  },
};
