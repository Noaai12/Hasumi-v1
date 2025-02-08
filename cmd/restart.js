module.exports = {
    name: "restart",
    aliases: ["reboot", "reload"],
    description: "Restart bot secara otomatis",
    usage: "/restart",
    author: "Edinst",
    cooldown: 5,
    role: 2, // Only BOT_ADMIN can use this command
    execute: async function(api, event, args) {
        try {
            await api.sendMessage("🔄 Bot akan direstart dalam 3 detik...", event.threadID);
            // Add delay to ensure message is sent
            setTimeout(() => {
                process.exit(1);  // Exit code 1 triggers restart in start.bat
            }, 3000);
        } catch (error) {
            console.error("Error in restart command:", error);
            api.sendMessage("❌ Gagal merestart bot", event.threadID);
        }
    }
};
