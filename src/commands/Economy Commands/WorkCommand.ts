import EconomySchema from "../../../models/economy";
import { RunFunction } from "../../interfaces/Command";

export const run: RunFunction = async (client, message, args) => {
  const Jobs: string[] = [
    "Programmer",
    "Uber",
    "Rocket Scientist",
    "Vade Developer",
    "Lead Vade Developer",
  ];
  const locateSchema = await EconomySchema.findOne({ User: message.author.id });
  const Job: string = Jobs[Math.floor(Math.random() * Jobs.length)];
  const Coins: number = Math.floor(Math.random() * 200);
  
  if(!locateSchema) {

    const newSchema = new EconomySchema({
      User: message.author.id,
      Wallet: Coins,
      Bank: 0,
    });

    await newSchema.save()

    return message.channel.send(
      `You earnt **${Coins}** by working as a **${Job}**!`
    );

  }
  
  
  
  await EconomySchema.updateOne({
    User: message.author.id,
    $inc: { Wallet: Coins },
  });
  return message.channel.send(
    `You earnt **${Coins}** by working as a **${Job}**!`
  );
};

export const name: string = "work";
export const category: string = "Economy";
export const cooldown: number = 30000;
export const premiumOnly: boolean = true;
export const description: string = "Work and earn yourself some Coins!";
