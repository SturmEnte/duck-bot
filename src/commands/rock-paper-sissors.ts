/*
With this command you can play a game of rock-paper-sissors
*/

import { CommandInteraction } from "discord.js";
import getRandomNumber from "../utils/randomNumber";

const RESULTS = {
   won: "You have won.",
   draw: "We have a draw.",
   lost: "You have lost.",
};

export default async function (interaction: CommandInteraction) {
   const rawSelection = interaction.options.get("selection", true);

   if (!rawSelection || !rawSelection.value) {
      await interaction.reply("You didn't choose rock, paper or sissors");
      return;
   }

   // Rock: 1
   // Paper: 2
   // Sissors: 3

   const selection: number = Number(rawSelection.value);

   if (selection === undefined || Number.isNaN(selection)) {
      await interaction.reply("Something went wrong. Your input was invalid.");
      console.error("Invalid rock-paper-sissors selection.", rawSelection, selection);
   }

   const botSelection = getRandomNumber(1, 3);

   let result: string;

   if (selection == 1 && botSelection == 1) {
      // Rock - Rock
      result = RESULTS.draw;
   } else if (selection == 1 && botSelection == 2) {
      // Rock - Paper
      result = RESULTS.lost;
   } else if (selection == 1 && botSelection == 3) {
      // Rock - Sissors
      result = RESULTS.won;
   } else if (selection == 2 && botSelection == 1) {
      // Paper - Rock
      result = RESULTS.won;
   } else if (selection == 2 && botSelection == 2) {
      // Paper - Paper
      result = RESULTS.draw;
   } else if (selection == 2 && botSelection == 3) {
      // Paper - Sissors
      result = RESULTS.lost;
   } else if (selection == 3 && botSelection == 1) {
      // Sissors - Rock
      result = RESULTS.lost;
   } else if (selection == 3 && botSelection == 2) {
      // Sissors - Paper
      result = RESULTS.won;
   } else if (selection == 3 && botSelection == 3) {
      // Sissors - Sissors
      result = RESULTS.draw;
   } else {
      interaction.reply("An error occurred while processing the input");
      return;
   }

   result += ` I chose ${numberToRPS(botSelection)}.`;

   await interaction.reply(result);
}

function numberToRPS(num) {
   switch (num) {
      case 1:
         return "🪨";
      case 2:
         return "📄";
      case 3:
         return "✂️";
      default:
         return "Invalid input"; // handle cases where input is not 1, 2, or 3
   }
}
