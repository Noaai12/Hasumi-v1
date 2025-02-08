const fs = require('fs');
const path = require('path');

module.exports = {
    name: "menu",
    aliases: ["help", "command", "commands"],
    description: "Menampilkan daftar perintah atau informasi detail command",
    usage: "/menu [nama_command]",
    author: "Edinst",
    cooldown: 5,
    role: 0,
    price: 1, // Harga command menu 1$
    execute: async function(api, event, args) {
        try {
            // Baca config
            const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

            // Jika ada argumen, tampilkan detail command spesifik
            if (args.length > 0) {
                const inputName = args[0].toLowerCase();
                const cmdFiles = fs.readdirSync('./cmd').filter(file => file.endsWith('.js'));
                
                let foundCommand = null;
                for (const file of cmdFiles) {
                    const cmdPath = path.join(process.cwd(), 'cmd', file);
                    delete require.cache[require.resolve(cmdPath)];
                    const cmd = require(cmdPath);
                    
                    if (cmd.name === inputName || (cmd.aliases && cmd.aliases.includes(inputName))) {
                        foundCommand = cmd;
                        break;
                    }
                }

                if (!foundCommand) {
                    return api.sendMessage(`❌ Command atau alias "${inputName}" tidak ditemukan.`, event.threadID);
                }

                let roleText = "User";
                if (foundCommand.role === 1) roleText = "Admin Group";
                if (foundCommand.role === 2) roleText = "Admin Bot";

                // Pastikan semua properti ada dengan nilai default
                const commandInfo = {
                    name: foundCommand.name,
                    description: foundCommand.description || "Tidak ada deskripsi",
                    usage: foundCommand.usage || `/${foundCommand.name}`,
                    aliases: foundCommand.aliases || [],
                    cooldown: foundCommand.cooldown || 5,
                    role: roleText,
                    price: foundCommand.price || 0,
                    author: foundCommand.author || "Unknown"
                };

                let cmdInfo = `╭────『 Command Info 』────\n`;
                cmdInfo += `│ Nama: ${commandInfo.name}\n`;
                cmdInfo += `│ Deskripsi: ${commandInfo.description}\n`;
                cmdInfo += `│ Penggunaan: ${commandInfo.usage}\n`;
                if (commandInfo.aliases.length > 0) {
                    cmdInfo += `│ Alias: ${commandInfo.aliases.join(', ')}\n`;
                }
                cmdInfo += `│ Cooldown: ${commandInfo.cooldown}s\n`;
                cmdInfo += `│ Role: ${commandInfo.role}\n`;
                cmdInfo += `│ Harga: ${commandInfo.price > 0 ? commandInfo.price + '$' : 'Gratis'}\n`;
                cmdInfo += `│ Author: ${commandInfo.author}\n`;
                cmdInfo += `╰───────────────`;

                return api.sendMessage(cmdInfo, event.threadID);
            }

            // Jika tidak ada argumen, tampilkan daftar semua command
            const cmdFiles = fs.readdirSync('./cmd').filter(file => file.endsWith('.js'));
            
            const commandGroups = {
                user: [],
                admin: [],
                botAdmin: []
            };

            cmdFiles.forEach(file => {
                if (file === 'menu.js') return;
                
                const cmdPath = path.join(process.cwd(), 'cmd', file);
                try {
                    delete require.cache[require.resolve(cmdPath)];
                    const cmd = require(cmdPath);
                    if (!cmd.name) return;
                    
                    const cmdInfo = {
                        name: cmd.name,
                        description: cmd.description || "Tidak ada deskripsi",
                        price: cmd.price || 0
                    };

                    const roleLevel = cmd.role || 0;
                    if (roleLevel === 2) commandGroups.botAdmin.push(cmdInfo);
                    else if (roleLevel === 1) commandGroups.admin.push(cmdInfo);
                    else commandGroups.user.push(cmdInfo);
                } catch (err) {
                    console.error(`Error loading command ${file}:`, err);
                }
            });

            let menuMessage = `╭─────『 ${config.botName} 』─────\n`;
            menuMessage += `│ Prefix: ${config.prefix}\n`;
            menuMessage += `│ Ketik: ${config.prefix}menu <command>\n`;
            menuMessage += `│ untuk info detail command\n`;
            menuMessage += `├────────────────\n`;

            if (commandGroups.user.length > 0) {
                menuMessage += `│ 👤 User Commands:\n`;
                commandGroups.user.forEach(cmd => {
                    const price = cmd.price > 0 ? ` (${cmd.price}$)` : ' (Gratis)';
                    menuMessage += `│ ⌁ ${config.prefix}${cmd.name}${price}\n`;
                    menuMessage += `│ └ ${cmd.description}\n`;
                });
                menuMessage += `├────────────────\n`;
            }

            if (commandGroups.admin.length > 0) {
                menuMessage += `│ 👑 Admin Commands:\n`;
                commandGroups.admin.forEach(cmd => {
                    const price = cmd.price > 0 ? ` (${cmd.price}$)` : ' (Gratis)';
                    menuMessage += `│ ⌁ ${config.prefix}${cmd.name}${price}\n`;
                    menuMessage += `│ └ ${cmd.description}\n`;
                });
                menuMessage += `├────────────────\n`;
            }

            if (commandGroups.botAdmin.length > 0) {
                menuMessage += `│ ⚡ Bot Admin Commands:\n`;
                commandGroups.botAdmin.forEach(cmd => {
                    const price = cmd.price > 0 ? ` (${cmd.price}$)` : ' (Gratis)';
                    menuMessage += `│ ⌁ ${config.prefix}${cmd.name}${price}\n`;
                    menuMessage += `│ └ ${cmd.description}\n`;
                });
                menuMessage += `├────────────────\n`;
            }

            menuMessage += `│ Total Commands: ${Object.values(commandGroups).flat().length}\n`;
            menuMessage += `╰────────────────\n`;
            menuMessage += config.copyright;

            api.sendMessage(menuMessage, event.threadID);

        } catch (error) {
            console.error("Error in menu command:", error);
            api.sendMessage("❌ Terjadi kesalahan saat menampilkan menu.", event.threadID);
        }
    }
};