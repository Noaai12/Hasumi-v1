const fs = require('fs');
const path = require('path');

module.exports = {
    name: "admin",
    aliases: [],
    description: "Manage admin UIDs",
    usage: "/admin <add|remove|list> [uid]",
    author: "Edinst",
    cooldown: 5,
    role: 2, // Only Bot Admins can use this command
    price: 0,
    execute: async function(api, event, args) {
        try {
            const configPath = path.join(process.cwd(), 'config.json');
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

            if (args.length === 0) {
                return api.sendMessage("❌ Usage: /admin <add|remove|list> [uid]", event.threadID);
            }

            const subCommand = args[0].toLowerCase();

            if (subCommand === "add") {
                if (args.length < 2) {
                    return api.sendMessage("❌ Usage: /admin add <uid>", event.threadID);
                }
                const uid = args[1];
                if (!config.adminBot.includes(uid)) {
                    config.adminBot.push(uid);
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                    return api.sendMessage(`✅ UID ${uid} added to admin list.`, event.threadID);
                } else {
                    return api.sendMessage(`❌ UID ${uid} is already an admin.`, event.threadID);
                }
            } else if (subCommand === "remove") {
                if (args.length < 2) {
                    return api.sendMessage("❌ Usage: /admin remove <uid>", event.threadID);
                }
                const uid = args[1];
                const index = config.adminBot.indexOf(uid);
                if (index > -1) {
                    config.adminBot.splice(index, 1);
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                    return api.sendMessage(`✅ UID ${uid} removed from admin list.`, event.threadID);
                } else {
                    return api.sendMessage(`❌ UID ${uid} is not an admin.`, event.threadID);
                }
            } else if (subCommand === "list") {
                let adminList = "👑 Admin UIDs:\n";
                for (const uid of config.adminBot) {
                    const userInfo = await api.getUserInfo(uid);
                    const name = userInfo[uid].name;
                    adminList += `- ${name} (${uid})\n`;
                }
                return api.sendMessage(adminList, event.threadID);
            } else {
                return api.sendMessage("❌ Invalid subcommand. Usage: /admin <add|remove|list> [uid]", event.threadID);
            }
        } catch (error) {
            console.error("Error in admin command:", error);
            api.sendMessage("❌ Terjadi kesalahan saat menjalankan perintah admin.", event.threadID);
        }
    }
};
