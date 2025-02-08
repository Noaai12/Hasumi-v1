const simpleGit = require('simple-git');
const git = simpleGit();
const Logger = require('../utils/log.js');

module.exports = {
    name: "update",
    aliases: ["pull", "upgrade"],
    description: "Update bot dari repository GitHub",
    usage: "/update",
    author: "Edinst",
    cooldown: 10,
    role: 2,
    execute: async function(api, event, args) {
        try {
            const checkMsg = await api.sendMessage("🔄 Memeriksa pembaruan dari GitHub...", event.threadID);
            
            // Fetch latest changes first
            await git.fetch();
            
            // Get logs between current and remote
            const status = await git.status();
            if (status.behind === 0) {
                await api.sendMessage("✅ Bot sudah menggunakan versi terbaru!", event.threadID);
                return;
            }

            // Get detailed changes
            const logs = await git.log(['HEAD..origin/main']);
            let updateInfo = "📝 Pembaruan yang tersedia:\n\n";
            logs.all.forEach(log => {
                updateInfo += `• ${log.message}\n`;
            });
            updateInfo += "\n👍 React jempol untuk mengupdate bot";

            // Send update info and wait for reaction
            const updateMsg = await api.sendMessage(updateInfo, event.threadID);
            
            // Wait for thumbs up reaction
            const handleReaction = async (reaction) => {
                if (reaction.messageID === updateMsg.messageID && 
                    reaction.userID === event.senderID && 
                    reaction.reaction === "👍") {
                    
                    // Remove reaction handler
                    api.unsendMessage(reaction.messageID);
                    
                    // Proceed with update
                    await api.sendMessage("🔄 Memulai proses update...", event.threadID);
                    
                    // Pull changes
                    const pull = await git.pull('origin', 'main');
                    
                    if (pull.summary.changes === 0) {
                        await api.sendMessage("❌ Gagal melakukan update!", event.threadID);
                        return;
                    }

                    const successMsg = `✅ Update berhasil!\n\n` +
                        `📊 Statistik perubahan:\n` +
                        `• File diubah: ${pull.summary.changes}\n` +
                        `• Baris ditambah: ${pull.summary.insertions}\n` +
                        `• Baris dihapus: ${pull.summary.deletions}\n\n` +
                        `🔄 Bot akan direstart dalam 3 detik...`;

                    await api.sendMessage(successMsg, event.threadID);
                    
                    Logger.info('Update successful, restarting bot...');
                    
                    setTimeout(() => {
                        process.exit(1);
                    }, 3000);
                }
            };

            // Add reaction handler
            api.listenMqtt((err, event) => {
                if (event.type === "message_reaction") {
                    handleReaction(event);
                }
            });

        } catch (error) {
            console.error("Error in update command:", error);
            api.sendMessage("❌ Gagal mengupdate bot: " + error.message, event.threadID);
        }
    }
};
