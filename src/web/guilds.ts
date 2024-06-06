import { Router } from "express";
import { Client } from "discord.js";

import Token from "../models/Token";

import getUserInfo from "../utils/getUserInfo";
import getUserGuilds from "../utils/getUserGuilds";
import AccessTokenManager from "../utils/accessTokenManager";

let client: Client;
let accessTokenManager: AccessTokenManager;

const router = Router();

export default function init(newClient: Client, newAccessTokenManager: AccessTokenManager) {
   client = newClient;
   accessTokenManager = newAccessTokenManager;
   return router;
}

router.get("/", async (req, res) => {
   const user_id = (await Token.findOne({ token: req.cookies.token })).user_id;
   const access_token = await accessTokenManager.getToken(user_id).catch((err) => {
      console.log("Error while getting access token:\n", err);
   });

   if (!access_token) {
      res.render("error", { url: process.env.OAUTH2_URL, error: "Failed to get access token" });
      return;
   }

   const userInfo = await getUserInfo(user_id, access_token).catch((err) => {
      console.log("Error while getting user info: \n", err);
   });

   if (!userInfo) {
      res.render("error", { url: process.env.OAUTH2_URL, error: "Failed to get user info" });
      return;
   }

   let guilds: Array<any> | undefined = await getUserGuilds(user_id, access_token).catch((err) => {
      console.log("Error while getting user's guilds: \n", err);
   });

   if (!guilds) {
      res.render("error", { url: process.env.OAUTH2_URL, error: "Failed to get guilds" });
      return;
   }

   // Remove all guilds that the bot is not a member of
   guilds = guilds.filter((guild) => {
      if (client.guilds.cache.has(guild.id)) return true;
      return false;
   });

   // Create array with guilds that the user is an admin of
   const adminGuilds: Array<any> = guilds.filter((guild) => {
      if ((guild.permissions & 0x8) == 8) return true;
      return false;
   });

   // Remove all guilds where the user is an admin of
   guilds = guilds.filter((guild) => {
      if (adminGuilds.includes(guild)) return false;
      return true;
   });

   res.render("guilds", { guilds, adminGuilds, user: userInfo });
});
