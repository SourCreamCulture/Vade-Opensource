import { RunFunction } from '../../interfaces/Command';
import fs from 'fs';
import { MessageAttachment, Collection, Message } from 'discord.js-light';
import officegen from 'officegen';

   export const run: RunFunction = async(client, message, args) => {

    if(message.channel.type !== "text") return;

    let pObj;
    
    //do transcripting - making a docx file with design. Here the Docs: https://github.com/Ziv-Barber/officegen/blob/4bfff80e0915f884199495c0ea64e5a0f0549cfe/manual/docx/README.md#prgapi
    let temporarymsg = await message.channel.send(new client.embed().setAuthor("Transcripting...", "https://cdn.discordapp.com/emojis/757632044632375386.gif?v=1"))
    let docx = officegen({
      type: 'docx',
      author: client.user.username,
      creator: client.user.username,
      description: `Transcript for the Channel #${message.channel.name} with the ID: ${message.channel.id}`,
      pageMargins: { top: 1000, right: 1000, bottom: 1000, left: 1000 },
      title: `Transcript!`

    })
    //Logs when to File Got CREATED   =  This does NOT mean that it is finished putting the text in!
    docx.on('finalize', function (written) {
      console.log('Finish to create a Microsoft Word document.')
    })
    //if an error occurs then stop
    docx.on('error', function (err) {
      console.log(err);
      return;
    })
    await message.react("📑"); //react to the message as a prove that everything above worked!
   
    pObj = docx.createP() 
    pObj.options.align = 'left';  
    pObj.options.indentLeft = -350;   
    
    pObj.options.indentFirstLine = -250; 
    pObj.addText('Transcript for:    #' + message.channel.name, { font_face: 'Arial', color: '3c5c63', bold: true, font_size: 22 }); //add the TEXT CHANNEL NAME
    pObj.addLineBreak() 
    pObj.addText("Channelid: " + message.channel.id, { font_face: 'Arial', color: '000000', bold: false, font_size: 10 }); //Channel id
    pObj.addLineBreak() 
    pObj.addText(`Oldest message at the BOTTOM `, { hyperlink: 'myBookmark', font_face: 'Arial', color: '5dbcd2', italic: true, font_size: 8 });  //Make a hyperlink to the BOOKMARK (Created later)
    pObj.addText(`  [CLICK HERE TO JUMP]`, { hyperlink: 'myBookmark', font_face: 'Arial', color: '1979a9', italic: false, bold: true, font_size: 8 });  //Make a hyperlink to the BOOKMARK (Created later)
    pObj.addLineBreak()
    //The text content collection
    let messageCollection = new Collection(); 
    let channelMessages;
    channelMessages = await message.channel.messages.fetch({ //fetch the last 100 messages
      limit: 100
    }).catch(err => console.log(err)); //catch error
    messageCollection = messageCollection.concat(channelMessages); 
    let tomanymsgs = 1; //some calculation for the messagelimit
    let msglimit;
    if (Number(msglimit) === 0) msglimit = 100; //if its 0 set it to 100
    let messagelimit = Number(msglimit) / 100; //devide it by 100 to get a counter
    if (messagelimit < 1) messagelimit = 1; //set the counter to 1 if its under 1
    while (channelMessages.size === 100) { //make a loop if there are more then 100 messages in this channel to fetch
      if (tomanymsgs === messagelimit) break; //if the counter equals to the limit stop the loop
      tomanymsgs += 1; //add 1 to the counter
      let lastMessageId = channelMessages.lastKey(); //get key of the already fetched messages above
      channelMessages = await message.channel.messages.fetch({ limit: 100, before: lastMessageId }).catch(err => console.log(err)); //Fetch again, 100 messages above the already fetched messages
      if (channelMessages) //if its true
        messageCollection = messageCollection.concat(channelMessages); //add them to the collection
    }
    let msgs = messageCollection.array().reverse(); //reverse the array to have it listed like the discord chat
    //now for every message in the array make a new paragraph!
    await msgs.forEach(async (msg: Message) => {
      // Create a new paragraph:
      pObj = docx.createP()
      pObj.options.align = 'left'; //Also 'right' or 'justify'.
      //Username and Date
      pObj.addText(`${msg.author.tag}`, { font_face: 'Arial', color: '3c5c63', bold: true, font_size: 14 });
      pObj.addText(`  ❤️  ${msg.createdAt.toDateString()}  ❤️  ${msg.createdAt.toLocaleTimeString()}`, { font_face: 'Arial', color: '3c5c63', bold: true, font_size: 14 }); //
      //LINEBREAK
      pObj.addLineBreak()
      //message of user     
      let umsg;

      if (msg.content.startsWith("```")) {
        umsg = msg.content.replace(/```/g, "");
      }
      else if (msg.attachments.size > 0) {
        umsg = "Unable to transcript (Embed/Video/Audio/etc.)";
      }
      else {
        umsg = msg.content;
      }
      pObj.addText(umsg, { font_face: 'Arial', color: '000000', bold: false, font_size: 10 });
      //LINEBREAK
      pObj.addLineBreak()
      pObj.addText(`______________________________________________________________________________________________________________________________________________________________________________________________________________`, { color: 'a6a6a6', font_size: 4 });

    });
    // Start somewhere a bookmark:
    pObj.startBookmark('myBookmark');  //add a bookmark at tha last message to make the jump 
    pObj.endBookmark();
    let out = fs.createWriteStream('transcript.docx')  //write everything in the docx file
    //if a error happens tells it
    out.on('error', function (err) {
      console.log(err)
    })
    //wenn the writing is finished
    out.on("finish", function (err, result) {
      try { // try to send the file
        const buffer = fs.readFileSync(`./transcript.docx`); //get a buffer file
        const attachment = new MessageAttachment(buffer, `./transcript.docx`); //send it as an attachment
        //send the Transcript Into the Channel and then Deleting it again from the FOLDER
        message.channel.send(attachment).then(del => { //after sending it delete the file and edit the temp message to an approvement
          temporarymsg.edit(new client.embed().setAuthor("Here is the Transcript", message.member.user.displayAvatarURL({ dynamic: true })))
          fs.unlinkSync(`./transcript.docx`)
        })
      } catch { // if the file is to big to be sent, then catch it!
        temporarymsg.edit(new client.embed().setTitle(`Too big!`).setErrorColor())
        fs.unlinkSync(`./transcript.docx`) //delete the docx
      }
    })
    // Async call to generate the output file:
    docx.generate(out)



    }
export const name: string = 'transcript';
export const category: string = 'Administrative';
export const description: string = 'Create a transcript for the current channel.';
export const userPerms: string[] = ['MANAGE_CHANNELS'];
export const premiumOnly: boolean = true;
