module.exports = {
    name: "kick",
    aliases: ["remove"],
    description: "Mengeluarkan pengguna dari grup",
    usage: "/kick <@tag>",
    author: "Edinst",
    cooldown: 5,
    role: 1,
    execute: async function(api, event, args) {
        try {
            const { mentions } = event;
            
            if (Object.keys(mentions).length === 0) {
                return api.sendMessage("❌ Tag pengguna yang ingin dikeluarkan!", event.threadID);
            }

            const threadInfo = await new Promise((resolve) => {
                api.getThreadInfo(event.threadID, (err, info) => {
                    if (err) return resolve(null);
                    resolve(info);
                });
            });

            if (!threadInfo) {
                return api.sendMessage("❌ Tidak dapat mengambil informasi grup!", event.threadID);
            }

            // Kick semua user yang di-mention
            for (const userID of Object.keys(mentions)) {
                api.removeUserFromGroup(userID, event.threadID, (err) => {
                    if (err) {
                        console.error(`Error kicking user ${userID}:`, err);
                    }
                });
            }

            api.sendMessage("✅ Berhasil mengeluarkan pengguna dari grup!", event.threadID);
        } catch (error) {
            console.error("Error in kick command:", error);
            api.sendMessage("❌ Terjadi kesalahan saat mengeluarkan pengguna.", event.threadID);
        }
    }
}; 