module.exports = {
    name: "restart",
    aliases: ["reboot", "reload"],
    description: "Restart bot secara otomatis",
    usage: "/restart",
    author: "Edinst",
    cooldown: 5,
    role: 2,
    execute: async function(api, event, args) {
        try {
            await api.sendMessage("🔄 Bot akan direstart dalam 3 detik\nsetelah restart garap aktif kan manual", event.threadID);
            
            // Give time for message to be sent and cleanup
            setTimeout(() => {
                // Exit with code 1 to trigger the restart handler in index.js
                process.exit(1);
            }, 3000);
        } catch (error) {
            console.error("Error in restart command:", error);
            api.sendMessage("❌ Gagal merestart bot: " + error.message, event.threadID);
        }
    }
};
