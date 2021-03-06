import { RunFunction } from "../../interfaces/Command";
import moment from "moment";

export const run: RunFunction = async (client, message, args) => {
  const now = new Date();
  const next = new Date(now);
  next.setFullYear(now.getFullYear() + 1);
  next.setHours(0, 0, 0, 0);
  next.setMonth(0, 1);
  const duration = Number(next) - Number(now);
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / 1000 / 60) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  const days = Math.floor(duration / (1000 * 60 * 60 * 24));

  const embed = new client.embed()
    .setAuthor("Next Year!", message.author.displayAvatarURL())
    .setClear()
    .setDescription(
      `There are **${days} days**, **${hours} hours**, **${minutes} minutes** and **${seconds} seconds** until **${next.getFullYear()}**!`
    )
    .setFooter(
      `Or, in short, ${moment.duration(Number(next) - Number(now)).humanize()}.`
    );
  message.channel.send(embed);
};
export const name: string = "nextyear";
export const category: string = "Fun";
export const description: string =
  "View how long is remaining until the next year.";
export const aliases: string[] = ["ny"];
