// Import dependencies
const { startWeb } = require('./app.js');
const fs = require("fs").promises;
const login = require("ryuu-fca-api");
const Logger = require('./utils/log.js');

// Jalankan web server
startWeb();

// Definisi variabel global
global.userData = {};
const USER_DATA_FILE = './userdata.json';
let groupData = {};
const GROUP_DATA_FILE = './groupdata.json';
global.commands = {};
let globalApi = null;
const cooldowns = {};
const COOLDOWN_TIME = 5000;

const ROLES = {
    USER: 0,
    GROUP_ADMIN: 1,
    BOT_ADMIN: 2
};

global.getUserRole = async function(api, event, config) {
    try {
        const uid = event.senderID;
        if (config.adminBot && config.adminBot.includes(uid)) {
            return ROLES.BOT_ADMIN;
        }
        if (event.isGroup) {
            const threadInfo = await new Promise((resolve, reject) => {
                api.getThreadInfo(event.threadID, (err, info) => {
                    if (err) reject(err);
                    else resolve(info);
                });
            });
            if (threadInfo.adminIDs && threadInfo.adminIDs.some(admin => admin.id === uid)) {
                return ROLES.GROUP_ADMIN;
            }
        }
        return ROLES.USER;
    } catch (error) {
        console.error("Error checking user role:", error);
        return ROLES.USER;
    }
};

async function loadUserData() {
    try {
        const config = await readConfig();
        const exists = await fs.access(USER_DATA_FILE).then(() => true).catch(() => false);
        if (!exists) {
            global.userData = {};
            await saveUserData();
            return;
        }

        const data = await fs.readFile(USER_DATA_FILE, 'utf8');
        try {
            global.userData = JSON.parse(data);
            let fakeIdCounter = 1;
            Object.keys(global.userData).forEach(uid => {
                if (global.userData[uid]) {
                    global.userData[uid].balance = Number(global.userData[uid].balance || 5.00).toFixed(2);
                    global.userData[uid].exp = Number(global.userData[uid].exp || 0.0).toFixed(1);
                    global.userData[uid].totalMessages = Number(global.userData[uid].totalMessages || 0);
                    global.userData[uid].id = global.userData[uid].id || fakeIdCounter++;
                }
            });
        } catch (parseError) {
            console.error("Error parsing userdata.json, creating new file:", parseError);
            global.userData = {};
        }
        await saveUserData();
    } catch (err) {
        console.error("Error in loadUserData:", err);
        global.userData = {};
        await saveUserData();
    }
}

async function saveUserData() {
    try {
        const formattedData = {};
        Object.keys(global.userData).forEach(uid => {
            if (global.userData[uid]) {
                formattedData[uid] = {
                    name: global.userData[uid].name || "Unknown User",
                    balance: Number(global.userData[uid].balance).toFixed(2),
                    exp: Number(global.userData[uid].exp).toFixed(1),
                    level: global.userData[uid].level || "newbie",
                    totalMessages: Number(global.userData[uid].totalMessages || 0),
                    id: global.userData[uid].id
                };
            }
        });
        const jsonString = JSON.stringify(formattedData, null, 2);
        await fs.writeFile(USER_DATA_FILE, jsonString, 'utf8');
    } catch (error) {
        console.error("Error saving user data:", error);
    }
}

function getUserLevel(exp) {
    if (exp <= 100) return "newbie";
    if (exp <= 250) return "user";
    if (exp <= 400) return "veteran";
    return "veteran";
}

function updateUserData(userID) {
    try {
        if (!globalApi) {
            console.error("API belum tersedia");
            return;
        }

        if (!global.userData[userID]) {
            const newId = Object.keys(global.userData).length + 1;
            global.userData[userID] = {
                name: "Unknown User",
                balance: 5.00,
                exp: 0.0,
                level: "newbie",
                totalMessages: 0,
                id: newId
            };

            globalApi.getUserInfo(userID, (err, info) => {
                if (!err && info[userID]) {
                    global.userData[userID].name = info[userID].name;
                    saveUserData();
                }
            });
        }

        const currentExp = Number(global.userData[userID].exp);

        // Remove balance increment
        global.userData[userID].exp = (currentExp + 0.1).toFixed(1);
        global.userData[userID].totalMessages = (global.userData[userID].totalMessages || 0) + 1;
        global.userData[userID].level = getUserLevel(Number(global.userData[userID].exp));

        if (!global.userData[userID].name || global.userData[userID].name === "Unknown User") {
            globalApi.getUserInfo(userID, (err, info) => {
                if (!err && info[userID]) {
                    global.userData[userID].name = info[userID].name;
                }
                saveUserData();
            });
        } else {
            saveUserData();
        }
    } catch (error) {
        console.error(`Error updating user data for ${userID}:`, error);
    }
}

async function loadGroupData() {
    try {
        const data = await fs.readFile(GROUP_DATA_FILE, 'utf8');
        groupData = JSON.parse(data);
    } catch (err) {
        groupData = {};
        await saveGroupData();
    }
}

async function saveGroupData() {
    try {
        await fs.writeFile(GROUP_DATA_FILE, JSON.stringify(groupData, null, 2));
    } catch (error) {
        console.error("Error saving group data:", error);
    }
}

async function updateGroupData(threadID) {
    try {
        if (!globalApi) {
            console.error("API belum tersedia");
            return;
        }

        const threadInfo = await new Promise((resolve, reject) => {
            globalApi.getThreadInfo(threadID, (err, info) => {
                if (err) reject(err);
                else resolve(info);
            });
        });

        groupData[threadID] = {
            tid: threadID,
            name: threadInfo.threadName || "Unknown Group",
            memberCount: threadInfo.participantIDs.length
        };

        await saveGroupData();
    } catch (err) {
        console.error("Error updating group data:", err);
    }
}

async function readConfig() {
    try {
        const configData = await fs.readFile('config.json', 'utf8');
        return JSON.parse(configData);
    } catch (err) {
        console.error("Terjadi kesalahan saat membaca config.json:", err);
        process.exit(1);
    }
}

function checkCooldown(userID, command) {
    if (!cooldowns[command.name]) {
        cooldowns[command.name] = new Map();
    }

    const now = Date.now();
    const timestamps = cooldowns[command.name];
    const cooldownAmount = (command.cooldown || 5) * 1000;

    if (timestamps.has(userID)) {
        const expirationTime = timestamps.get(userID) + cooldownAmount;
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return timeLeft.toFixed(1);
        }
    }

    timestamps.set(userID, now);
    setTimeout(() => timestamps.delete(userID), cooldownAmount);
    return false;
}

global.loadCommands = async function() {
    let newCommands = {};
    try {
        // Hapus semua cache command
        Object.keys(require.cache).forEach(key => {
            if (key.includes('/cmd/')) {
                delete require.cache[key];
            }
        });

        const config = await readConfig();
        const files = await fs.readdir('./cmd');
        for (const file of files) {
            if (file.endsWith('.js')) {
                try {
                    const cmdPath = `./cmd/${file}`;
                    delete require.cache[require.resolve(cmdPath)];
                    
                    const originalCmd = require(cmdPath);
                    if (!originalCmd.name) {
                        Logger.warn(`Command in ${file} has no name`);
                        continue;
                    }

                    // Skip commands listed in unloadedCommands
                    if (config.unloadedCommands && config.unloadedCommands.includes(originalCmd.name)) {
                        continue;
                    }

                    // Buat command baru dengan properti yang diambil dari originalCmd termasuk price
                    const command = {
                        name: originalCmd.name,
                        aliases: originalCmd.aliases || [],
                        description: originalCmd.description || "Tidak ada deskripsi",
                        usage: originalCmd.usage || `/${originalCmd.name}`,
                        author: originalCmd.author || "Unknown",
                        cooldown: originalCmd.cooldown || 5,
                        role: originalCmd.role || ROLES.USER,
                        price: originalCmd.price || 0,
                        execute: originalCmd.execute
                    };

                    // Simpan command utama
                    newCommands[command.name] = command;

                    // Simpan aliases dengan referensi ke command yang sama
                    if (command.aliases && command.aliases.length > 0) {
                        command.aliases.forEach(alias => {
                            newCommands[alias] = command;
                        });
                    }

                } catch (cmdLoadError) {
                    Logger.error(`Failed to load command ${file}: ${cmdLoadError}`);
                }
            }
        }

        global.commands = newCommands;
        return global.commands;
    } catch (err) {
        Logger.error(`Error reading commands directory: ${err}`);
        return global.commands;
    }
};

function setFacebookOptions(api) {
    api.setOptions({
        listenEvents: true,
        selfListen: false,
        logLevel: "silent",
        updatePresence: false,
        forceLogin: true,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
    });
}

function simulateHumanBehavior(api) {
    const actions = [
        () => api.setOptions({ listenEvents: true }),
        () => api.setOptions({ selfListen: false }),
        () => api.setOptions({ logLevel: "silent" }),
        () => api.setOptions({ updatePresence: false }),
        () => api.setOptions({ forceLogin: true }),
        () => api.setOptions({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3" })
    ];

    setInterval(() => {
        const action = actions[Math.floor(Math.random() * actions.length)];
        action();
    }, 60000); // Perform a random action every 60 seconds
}

async function handleReply(api, event) {
    if (event.messageReply) {
        const repliedMessage = event.messageReply;
        const repliedSenderID = repliedMessage.senderID;

        // If the bot's message is replied to, delete the bot's message
        if (repliedSenderID === api.getCurrentUserID()) {
            api.deleteMessage(repliedMessage.messageID, (err) => {
                if (err) console.error("Failed to delete bot message:", err);
            });
        } else {
            // Otherwise, handle user reply
            const repliedUserID = repliedMessage.senderID;
            api.sendMessage(`You replied to user with ID: ${repliedUserID}`, event.threadID);
        }
    }
}

async function initializeBot() {
    try {
        await loadUserData();
        await loadGroupData();

        const config = await readConfig();
        const prefix = config.prefix;

        await global.loadCommands();

        setInterval(async () => {
            try {
                await global.loadCommands();
            } catch (reloadError) {
                console.error('❌ Error during auto-reload:', reloadError);
            }
        }, 3000);

        commands['prefix'] = {
            name: 'prefix',
            execute: function(api, event, args) {
                api.sendMessage(`Prefix:\n${prefix}`, event.threadID);
            }
        };

        const prefixKeywords = ['prefix', 'Prefix'];
        const appState = await fs.readFile('appstate.json', 'utf8');

        login({appState: JSON.parse(appState)}, (err, api) => {
            if(err) {
                console.error("Error saat login:", err);
                return;
            }

            globalApi = api;
            setFacebookOptions(api);
            simulateHumanBehavior(api); // Call the new method here

            api.setOptions({listenEvents: true});

            var stopListening = api.listenMqtt(async (err, event) => {
                if(err) {
                    console.error("Error saat mendengarkan pesan:", err);
                    return;
                }

                api.markAsRead(event.threadID, (err) => { 
                    if(err) console.error("Gagal menandai pesan sebagai terbaca:", err); 
                });

                switch(event.type) {
                    case "message":
                        try {
                            await updateUserData(event.senderID);
                            await updateGroupData(event.threadID);

                            const lowercaseMessage = event.body.toLowerCase();
                            if (prefixKeywords.some(keyword => lowercaseMessage.includes(keyword))) {
                                api.sendMessage(`Prefix:\n${prefix}`, event.threadID);
                            }

                            if(event.body.startsWith(prefix)) {
                                const commandBody = event.body.slice(prefix.length).trim();
                                const args = commandBody.split(/ +/);
                                const commandName = args.shift().toLowerCase();
                                const command = commands[commandName];

                                if (command) {
                                    const cooldownTime = checkCooldown(event.senderID, command);
                                    if (cooldownTime) {
                                        api.sendMessage(
                                            `Mohon tunggu ${cooldownTime} detik sebelum menggunakan command ${command.name} lagi.`,
                                            event.threadID
                                        );
                                        return;
                                    }

                                    const userRole = await getUserRole(api, event, config);
                                    if (userRole < command.role) {
                                        const roleNames = {
                                            0: "User",
                                            1: "Admin Grup",
                                            2: "Admin Bot"
                                        };
                                        return api.sendMessage(
                                            `❌ Anda tidak memiliki izin untuk menggunakan command ini.\nMinimal role: ${roleNames[command.role]}`, 
                                            event.threadID
                                        );
                                    }

                                    // Cek balance user sebelum menjalankan command berbayar
                                    if (command.price > 0) {
                                        const userBalance = Number(global.userData[event.senderID]?.balance || 0);
                                        if (userBalance < command.price) {
                                            return api.sendMessage(
                                                `❌ Balance Anda tidak cukup untuk menggunakan command ini.\nHarga: ${command.price}\nBalance Anda: ${userBalance}`, 
                                                event.threadID
                                            );
                                        }
                                        
                                        // Kurangi balance user
                                        global.userData[event.senderID].balance = (userBalance - command.price).toFixed(2);
                                        await saveUserData();
                                    }

                                    await command.execute(api, event, args);
                                } else {
                                    api.sendMessage("Perintah tidak ditemukan!", event.threadID);
                                }
                            }

                            // Handle message replies
                            await handleReply(api, event);

                        } catch (error) {
                            console.error("Error in message handler:", error);
                        }
                        break;

                    case "event":
                        await updateGroupData(event.threadID);
                        console.log(event);
                        break;
                }
            });
        });
    } catch (mainError) {
        console.error("Terjadi kesalahan utama:", mainError);
    }
}

// Add this before initializeBot() call:
process.on('exit', (code) => {
    if (code === 1) {
        Logger.info('Restarting bot...');
        require('child_process').spawn(process.argv.shift(), process.argv, {
            cwd: process.cwd(),
            detached: true,
            stdio: 'inherit'
        });
    }
});

process.on('uncaughtException', (err) => {
    Logger.error('Uncaught Exception:', err);
    process.exit(1); // This will trigger restart
});

process.on('unhandledRejection', (err) => {
    Logger.error('Unhandled Rejection:', err);
    process.exit(1); // This will trigger restart
});

initializeBot().catch(err => {
    Logger.error("Error dalam inisialisasi bot:", err);
    process.exit(1); // Changed from direct exit to exit with code 1
});

// Tampilkan logo saat startup
Logger.showLogo();
Logger.info('Starting bot...');