const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    name: "cmd",
    aliases: ["command"],
    description: "Manage commands dynamically",
    usage: "/cmd <install|remove|load|unload> <name> [content|url]",
    author: "Edinst",
    cooldown: 5,
    role: 2,
    execute: async function(api, event, args) {
        if (args.length < 2) {
            return api.sendMessage("❌ Usage: /cmd <install|remove|load|unload> <name> [content|url]", event.threadID);
        }

        const action = args[0].toLowerCase();
        const cmdName = args[1].toLowerCase();
        const cmdPath = path.join(process.cwd(), 'cmd', `${cmdName}.js`);
        const configPath = path.join(process.cwd(), 'config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        // Ensure unloadedCommands is defined
        if (!config.unloadedCommands) {
            config.unloadedCommands = [];
        }

        if (action === 'install') {
            if (args.length < 3) {
                return api.sendMessage("❌ Usage: /cmd install <name> <content|url>", event.threadID);
            }

            const contentOrUrl = args.slice(2).join(' ');

            try {
                let content;
                if (contentOrUrl.startsWith('http')) {
                    const response = await axios.get(contentOrUrl);
                    content = response.data;
                } else {
                    content = contentOrUrl;
                }

                fs.writeFileSync(cmdPath, content);
                return api.sendMessage(`✅ Command ${cmdName} installed successfully.`, event.threadID);
            } catch (err) {
                console.error(err);
                return api.sendMessage('❌ Failed to install command: ' + err.message, event.threadID);
            }
        } else if (action === 'remove') {
            try {
                if (fs.existsSync(cmdPath)) {
                    fs.unlinkSync(cmdPath);
                    return api.sendMessage(`✅ Command ${cmdName} removed successfully.`, event.threadID);
                } else {
                    return api.sendMessage('❌ Command not found!', event.threadID);
                }
            } catch (err) {
                console.error(err);
                return api.sendMessage('❌ Failed to remove command: ' + err.message, event.threadID);
            }
        } else if (action === 'load') {
            try {
                if (cmdName === 'all') {
                    const cmdFiles = fs.readdirSync('./cmd').filter(file => file.endsWith('.js'));
                    cmdFiles.forEach(file => {
                        const cmdPath = path.join(process.cwd(), 'cmd', file);
                        delete require.cache[require.resolve(cmdPath)];
                        const cmd = require(cmdPath);
                        global.commands[cmd.name] = cmd;
                    });
                    config.unloadedCommands = [];
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                    return api.sendMessage('✅ All commands loaded successfully.', event.threadID);
                } else {
                    delete require.cache[require.resolve(cmdPath)];
                    const cmd = require(cmdPath);
                    global.commands[cmd.name] = cmd;
                    config.unloadedCommands = config.unloadedCommands.filter(name => name !== cmdName);
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                    return api.sendMessage(`✅ Command ${cmdName} loaded successfully.`, event.threadID);
                }
            } catch (err) {
                console.error(err);
                return api.sendMessage('❌ Failed to load command: ' + err.message, event.threadID);
            }
        } else if (action === 'unload') {
            try {
                if (cmdName in global.commands) {
                    delete global.commands[cmdName];
                    if (!config.unloadedCommands.includes(cmdName)) {
                        config.unloadedCommands.push(cmdName);
                    }
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                    return api.sendMessage(`✅ Command ${cmdName} unloaded successfully.`, event.threadID);
                } else {
                    return api.sendMessage('❌ Command not found!', event.threadID);
                }
            } catch (err) {
                console.error(err);
                return api.sendMessage('❌ Failed to unload command: ' + err.message, event.threadID);
            }
        } else {
            return api.sendMessage("❌ Invalid action. Usage: /cmd <install|remove|load|unload> <name> [content|url]", event.threadID);
        }
    }
};
