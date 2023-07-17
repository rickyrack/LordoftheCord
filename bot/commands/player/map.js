const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const { getUser } = require("../../../backend/firestore/utility/get_user");
const { move } = require("../../../backend/firestore/player/move");
const {
  getLocations,
} = require("../../../backend/firestore/utility/get_locations");
const { useCommand, setActive } = require("../../../backend/misc/active_users");
const { Party } = require("../../helper/models/PartyClass");

module.exports = {
  data: new SlashCommandBuilder().setName("map").setDescription("map TEST"),
  async execute(interaction) {
    let { user, userData } = await useCommand(interaction, true); if (userData.closeCommand) return;

    let mapOpen = true;
    let restart = true;
    let firstInt = true;

    const mapOpenCheck = setInterval(() => {
      if (!mapOpen) {
        setActive(user.id, false);
        clearInterval(mapOpenCheck);
      }
      if (restart && mapOpen) {
        restart = false;
        mapFunction();
      }
    }, 300);

    async function mapFunction() {
      userData = await getUser(user);
      if(!userData) userData = await getUser(user);

      const mapData = require("../../../backend/map/map.json").map;
      let tileSet = require("../../../backend/map/tile_set.json");

      const party = new Party(userData);

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

      const locations = await getLocations();
      console.log(locations)

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
            let noLocation = true;
            locations.forEach((location) => {
              if (
                tile.coords[0] === location.coords.x &&
                tile.coords[1] === location.coords.y
              ) {
                noLocation = false;
                displayMap += tileSet[location.type].emojis;
              }
            });
            if (noLocation) {
              // assigns tile specific emoji based on emojiNum
              const emojiNum = tile.emojiNum % tileSet[tile.type].emojis.length;
              displayMap += tileSet[tile.type].emojis[emojiNum];
            }
          }
        }
        displayMap += "\n";
      }

      const mapEmbed = new EmbedBuilder()
        .setTitle(`World Map\n:slight_smile: ${userData.stats.morale} <:PartySize:1129186732479369266> ${party.length()}/${party.maxSize()} <:Gold:1129184925418000454> ${userData.stats.gold} <:Honor:1130331174489817118> ${userData.stats.honor}`)
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
          // return;
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
        if (reason === "time" && mapOpen === true) {
          mapOpen = false;
          await interaction.editReply({
            embeds: [timeoutEmbed],
            components: [],
          });
        }
      });
    }
  },
};
