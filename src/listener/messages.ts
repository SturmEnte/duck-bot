import {
   CategoryChannel,
   ChannelType,
   Client,
   GuildTextBasedChannel,
   Message,
   OverwriteType,
   PartialMessage,
   TextBasedChannel,
   AttachmentBuilder,
} from "discord.js";

import axios from "axios";

import MessageKeeper from "../models/MessageKeeper";

export default function (client: Client) {
   // Message keeper
   client.on("messageDelete", async (message) => {
      // Check if there is a message keeper for that channel
      if (!(await MessageKeeper.exists({ guild: message.guild.id, channel: message.channel.id }))) {
         return;
      }

      let guild = await client.guilds.cache.find((guild) => guild.name == "cache");

      if (!guild) {
         guild = await client.guilds.create({ name: "cache" });
      }

      // Get info about who deleted the message
      const logs = await message.guild.fetchAuditLogs({ type: 72 });
      const entry = logs.entries.find((entry) => {
         if (message.partial) return entry.extra.channel.id == message.channel.id;
         return entry.extra.channel.id == message.channel.id && entry.target.id == message.author.id;
      });

      // Check if the deletor is the owner
      if (entry.executor.id == message.guild.ownerId) {
         return;
      }

      if (message.partial) {
         const category: CategoryChannel = <CategoryChannel>(
            await guild.channels.cache.find((channel) => channel.name.toLowerCase() === message.guild.id && channel.type == ChannelType.GuildCategory)
         );

         if (category) {
            const channel: GuildTextBasedChannel = <GuildTextBasedChannel>(
               category.children.cache.find((channel) => channel.name.toLowerCase() === message.channel.id && channel.type == ChannelType.GuildText)
            );

            if (channel) {
               const cachedMessage = await getCachedMessage(channel, message);

               let content: string;

               try {
                  const attachment = cachedMessage.attachments.find((attachment) => attachment.name == "content.txt");
                  if (attachment) {
                     const res = await axios({ url: attachment.url, method: "GET", responseType: "blob" });
                     content = Buffer.from(res.data, "hex").toString("utf8");
                  }
               } catch (err) {}

               if (content) message.content = content;
               else message.content = "Message content couldn't be recovered 😭";
            } else {
               message.content = "Message content couldn't be recovered 😭";
            }
         } else {
            message.content = "Message content couldn't be recovered 😭";
         }
      }

      const info = `${entry.executor.toString()} deleted a message from ${entry.target.toString()}. Here is the message content`;

      if (message.content.length > 2000 - info.length - ":\n".length) {
         await message.channel.send(info + " (next message):\n");
         await message.channel.send(message.content);
         return;
      }

      await message.channel.send(info + ":\n" + message.content);
   });

   client.on("messageCreate", async (message) => {
      if (!(await MessageKeeper.exists({ guild: message.guild.id, channel: message.channel.id }))) {
         return;
      }

      let guild = await client.guilds.cache.find((guild) => guild.name == "cache");

      if (!guild) {
         guild = await client.guilds.create({ name: "cache" });
      }

      let category: CategoryChannel = <CategoryChannel>(
         await guild.channels.cache.find((channel) => channel.name.toLowerCase() === message.guild.id && channel.type == ChannelType.GuildCategory)
      );

      if (!category) {
         category = await guild.channels.create({
            name: message.guild.id,
            type: ChannelType.GuildCategory,
            permissionOverwrites: [{ type: OverwriteType.Role, id: guild.roles.everyone.id, deny: ["ViewChannel", "ReadMessageHistory"] }],
         });
      }

      let channel: GuildTextBasedChannel = <GuildTextBasedChannel>(
         category.children.cache.find((channel) => channel.name.toLowerCase() === message.channel.id && channel.type == ChannelType.GuildText)
      );

      if (!channel) {
         channel = await category.children.create({
            name: message.channel.id,
            type: ChannelType.GuildText,
            permissionOverwrites: [{ type: OverwriteType.Role, id: message.guild.roles.everyone.id, deny: ["ViewChannel", "ReadMessageHistory"] }],
         });
      }

      await channel.send({
         content: message.id,
         files: [new AttachmentBuilder(Buffer.from(Buffer.from(message.content, "utf8").toString("hex")), { name: "content.txt" })],
      });
   });

   client.on("messageUpdate", async (oldMessage, newMessage) => {
      if (!(await MessageKeeper.exists({ guild: newMessage.guild.id, channel: newMessage.channel.id }))) {
         return;
      }

      console.log(oldMessage.content + " -> " + newMessage.content);

      let guild = await client.guilds.cache.find((guild) => guild.name == "cache");

      if (!guild) {
         guild = await client.guilds.create({ name: "cache" });
      }

      let category: CategoryChannel = <CategoryChannel>(
         await guild.channels.cache.find((channel) => channel.name.toLowerCase() === newMessage.guild.id && channel.type == ChannelType.GuildCategory)
      );

      if (!category) {
         category = await guild.channels.create({
            name: newMessage.guild.id,
            type: ChannelType.GuildCategory,
            permissionOverwrites: [{ type: OverwriteType.Role, id: guild.roles.everyone.id, deny: ["ViewChannel", "ReadMessageHistory"] }],
         });
      }

      let channel: GuildTextBasedChannel = <GuildTextBasedChannel>(
         category.children.cache.find((channel) => channel.name.toLowerCase() === newMessage.channel.id && channel.type == ChannelType.GuildText)
      );

      if (!channel) {
         channel = await category.children.create({
            name: newMessage.channel.id,
            type: ChannelType.GuildText,
            permissionOverwrites: [{ type: OverwriteType.Role, id: newMessage.guild.roles.everyone.id, deny: ["ViewChannel", "ReadMessageHistory"] }],
         });
      }

      try {
         const message = await getCachedMessage(channel, <PartialMessage>newMessage);
         await message.delete();
      } catch (err) {}

      await channel.send({
         content: newMessage.id,
         files: [new AttachmentBuilder(Buffer.from(Buffer.from(newMessage.content, "utf8").toString("hex")), { name: "content.txt" })],
      });
   });
}

async function getCachedMessage(channel: TextBasedChannel, targetMessage: PartialMessage): Promise<Message | undefined> {
   let message: Message | undefined;

   let options = {};

   while (true) {
      const messages = await channel.messages.fetch(options);

      if (!messages.last()) break;

      let keys = messages.keys();

      for (let i = 0; i < messages.size; i++) {
         const msg = messages.get(keys.next().value);

         if (msg.content == targetMessage.id) {
            message = msg;
         }
      }

      if (message) break;

      options = { before: messages.last().id };
   }

   return message;
}
