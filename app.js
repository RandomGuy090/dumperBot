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
let fsp = require(`fs/promises`);
var Map = require("collection-map");

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
            break;
        }
    }
}

client.on("ready", () => {
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

    if (msg.content.startsWith("+help")) {
        msg.channel.send(` 
            +dump:
                -u      select user
                -c      amount images to save
            `);
    }

    if (msg.attachments.first()) {
        console.log("attachment");
        client.user.setActivity(`"saving...."`);

        let path = create_folders(msg);
        let name = path + "/" + msg.attachments.first().name;
        let url = msg.attachments.first().url;
        save_img(url, name);
        client.user.setActivity(`"+dump"`);
    }

    if (msg.content.startsWith("+dump")) {
        const args = msg.content.trim().split(/ +/g);
        for (var i = 0; i <= args.length; i++) {
            console.log(args[i]);
            switch (args[i]) {
                case "-u":
                    var lookForUser = args[i + 1];
                    break;
                case "-c":
                    var limit = args[i + 1];
                    break;
            }
        }
        console.log(args[1] !== "undefined");
        console.log(parseInt(args[1]) !== "NaN");

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
                
                console.log(buffer.length);

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
    client.user.setActivity(`"+dump"`);
});

client.login(pass.TOKEN);
