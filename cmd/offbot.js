module.exports = {
    name: "offbot",
    aliases: ["shutdown", "turnoff"],
    description: "Matikan bot secara otomatis",
    usage: "/offbot",
    author: "Edinst",
    cooldown: 5,
    role: 2, // Only BOT_ADMIN can use this command
    execute: async function(api, event, args) {
        try {
            api.sendMessage("Bot akan dimatikan...", event.threadID, () => {
                process.exit(0);
            });
        } catch (error) {
            console.error("Error in offbot command:", error);
            api.sendMessage("❌ Gagal mematikan bot", event.threadID);
        }
    }
};
