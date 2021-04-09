"use strict";
import { createRequire } from "module";
const require = createRequire(import.meta.url);


console.log("BOT STARTED");

/*file with personal info
template:
import pass from "./passTempl.js";*/
import pass from "./pass.js";

const Discord = require("discord.js");
let request = require(`request`);
let fs = require(`fs`);
let os = require(`os`);
let fsp = require(`fs/promises`);
var Map = require("collection-map");

/*var enableLogs = true;*/
var enableLogs = false;
var lastAttachment = "";

let limit = 100;
const dumpPath = pass.SAVE_PATH;
const client = new Discord.Client();

function format_date() {
    let date = new Date();
    let month = (date.getMonth() + 1).toString();
    let day = date.getDate().toString();
    let year = date.getFullYear().toString();

    if (month.length == 1) {
        month = "0" + month;
    }
    if (day.length == 1) {
        day = "0" + day;
    }
    return year + "_" + month + "_" + day;
}

function create_folders(msg) {
    var channel = msg.channel.name;
    var guild = msg.guild.name;

    guild = dumpPath + "/" + guild;
    if (!fs.existsSync(guild)) {
        fs.mkdirSync(channel, { recursive: true });
    }
    channel = guild + "/" + channel;
    if (!fs.existsSync(channel)) {
        fs.mkdirSync(channel, { recursive: true });
    }

    if (!fs.existsSync(channel)) {
        fs.mkdirSync(channel, { recursive: true });
    }

    let ret = channel + "/" + format_date();
    fs.readdir(channel, (err, files) => {
        if (err) {
            throw err;
        }
    });

    if (!fs.existsSync(ret)) {
        fs.mkdirSync(ret, { recursive: true });
    }
    return ret;
}

function download(url, name) {
    try {
        request.get(url).on("error", console.error).pipe(fs.createWriteStream(name));
    } catch (e) {
        return false;
    }
}

function save_img(url, name) {
    let x = 0;
    while (1 || x < 5) {
        x++;
        let res = fs.existsSync(name);
        if (res) {
            name = name + "0";
        } else {
            download(url, name);
            return name;
            break;
        }
    }
}


function writeLog(msg){
    let path = create_folders(msg);
    let name = path + "/logs.txt";
      
    fs.readFile(name,(err, data) => {

        console.log(data)

        if (typeof(data) === "undefined"){
           /*when file hasn't got content*/
           console.log("empty");
                fs.appendFile(name, `<-----------------#${msg.channel.name}------------$${msg.channel.guild.name}------------------>\n`, (err) => {
                if (err) throw err;
            });
        }
    });
  
    var nickName = (msg.author.username+ "                 |").substring(0, 15);;
    var date = new Date();
    var hours = ((date.getHours()<10?"0":"")+date.getHours())
    var min = ((date.getMinutes()<10?"0":"")+date.getMinutes())
    var buffer = `${hours}:${min} ${nickName} |`
    

    
    if (msg.content) {
        buffer += msg.content;
    }

    if (msg.attachments.first()) {
        if (lastAttachment == "") {
            lastAttachment = msg.attachments.first().name;
        }
        buffer += `Sent image: ${lastAttachment}\n`
    }


    fs.appendFile(name, buffer+"\n", (err) => {
        if (err) throw err;
    });
}

client.on("ready", (chan) => {
    console.log("I am ready!");
    client.user.setActivity(`"+dump"`);
});

client.on("message", (msg) => {
    console.log("");
    console.log("server: " + msg.channel.guild.name);
    console.log("chanel name: " + msg.channel.name);
    console.log("autor: " + msg.author.username);


    if (msg.content === "+ping") {
        msg.channel.send("pong");
    }

    if (msg.content === "+dump -l") {
        if (enableLogs) {
            msg.channel.send("saving chats disabled");
        }else{
            msg.channel.send("saving chats enabled");
        }
        enableLogs = !enableLogs;
    }

    if (msg.content.startsWith("+help")) {
        msg.channel.send(` 
            +dump:
                -u      select user
                -c      amount images to save
                -i      platform info
                -l      enable/disable logs
            `);
    }

    if(msg.content === "+dump -i"){
        msg.channel.send(`
            +dump:
                hostname:       ${os.hostname()}
                system:         ${os.platform()}
                architecture:   ${os.arch()}
                saving logs:   ${enableLogs}
            `)
    }


    if (msg.attachments.first()) {
        console.log("attachment");
        client.user.setActivity(`"saving...."`);

        let path = create_folders(msg);
        let name = path + "/" + msg.attachments.first().name;
        let url = msg.attachments.first().url;
        lastAttachment = save_img(url, name);
    }

    if (msg.content.startsWith("+dump")) {
        const args = msg.content.trim().split(/ +/g);
        for (var i = 0; i <= args.length; i++) {
            
            switch (args[i]) {
                case "-u":
                    var lookForUser = args[i + 1];
                    break;
                case "-c":
                    var limit = args[i + 1];
                    break;
            }
        }
        
        

        msg.channel.messages
            .fetch()
            .then((messages) => {
                var buffer = Array();
                
                /*filter for specific user*/
                if (lookForUser) {
                    var user = messages.filter((user) => user.author.username == lookForUser);
                    user.forEach((elem) => {
                        elem.attachments.forEach((attach) => {
                            buffer.push(attach);
                        });
                    });
                } else {
                /*fileter without any user*/
                    messages.filter((user) => {
                        user.attachments.forEach((attachment) => {
                            buffer.push(attachment);
                        });
                    });
                }
                

                let x = 0;
                for (var i = 0; i <= buffer.length - 1; i++) {
                    if (x == limit) {
                        break;
                    }
                    x++;
                    let path = create_folders(msg);
                    let name = path + "/" + buffer[i].name;
                    save_img(buffer[i].url, name);
                }
            })
            .catch(console.error);
            
    }
    if (enableLogs) {
            writeLog(msg);
    }
});

client.login(pass.TOKEN);
