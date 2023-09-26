import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";
import {
  GatewayDispatchEvents,
  GatewayIntentBits,
  Client,
} from "@discordjs/core";

// Create REST and WebSocket managers directly
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

const gateway = new WebSocketManager({
  token: process.env.DISCORD_TOKEN,
  intents: GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent,
  rest,
});

// Create a client to emit relevant events.
const client = new Client({ rest, gateway });

// Listen for interactions
// Each event contains an `api` prop along with the event data that allows you to interface with the Discord REST API
client.on(
  GatewayDispatchEvents.MessageReactionAdd,
  async ({ data: reaction, user }) => {
    // Ignore when PinIt react
    if (user === client.user) return;

    // Ignore when the reaction wasn't :pushpin: or :x:
    if (!(reaction.emoji.name === "📌" || reaction.emoji.name === "❌")) return;

    const data = await reaction.fetch();

    // Ignore when the reaction event fired in DM
    if (!data.message.guild) return;

    const guild = data.message.guild;
    const guildMember = data.message.guild.member(user.id);

    const roleID = new Array();
    const blacklist = ["@everyone", "bot", "robot"];

    guild.me.roles.cache.forEach((role) => {
      if (role.managed) return;
      if (blacklist.includes(role.name.toLowerCase())) return;
      roleID.push(role.id);
    });

    guildMember.roles.cache.forEach((role) => {
      if ((roleID.length && roleID.includes(role.id)) || !roleID.length) {
        // Treat with 📌
        if (reaction.emoji.name === "📌" && data.count === 1) {
          reaction.remove();
          data.message.pin();
          data.message.react("❌");
        }

        // Treat with ❌
        if (reaction.emoji.name === "❌" && data.message.pinned) {
          reaction.remove();
          data.message.unpin();
        }
      } else {
        reaction.users.remove(guildMember);
      }
    });
  }
);

// Listen for the ready event
client.once(GatewayDispatchEvents.Ready, () => console.log("Ready!"));

// Start the WebSocket connection.
gateway.connect();
