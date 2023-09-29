import datetime
import discord
import os

intents = discord.Intents.default()
intents.messages = True
intents.message_content = True
intents.reactions = True

client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f'Logged in as {client.user.name}')

async def fetch_message(reaction):
    guild = await client.fetch_guild(reaction.guild_id)
    channel = await client.fetch_channel(reaction.channel_id)
    return await channel.fetch_message(reaction.message_id)

@client.event
async def on_raw_reaction_add(reaction):
    if reaction.emoji.name == "📌":
        print(f'{datetime.datetime.now()} Pinning {reaction.message_id}')
        message = await fetch_message(reaction)
        await message.pin()

@client.event
async def on_raw_reaction_remove(reaction):
    if reaction.emoji.name == "📌":
        print(f'{datetime.datetime.now()} Unpinning {reaction.message_id}')
        message = await fetch_message(reaction)
        
        if not ":pushpin:" in [ reaction.emoji for reaction in message.reactions]:
            await message.unpin()

if __name__ == '__main__':
    client.run(os.environ["DISCORD_BOT_TOKEN"])
