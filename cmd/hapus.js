module.exports = {
    name: "hapus",
    aliases: ["delete", "del", "unsend"],
    description: "Delete messages by reply",
    usage: "{prefix}hapus [reply to message]",
    cooldown: 3,
    async execute(api, event, args) {
        // Helper to check permissions
        const checkPermissions = async (threadID, userID) => {
            return new Promise((resolve) => {
                api.getThreadInfo(threadID, (err, info) => {
                    if (err) resolve(false);
                    else {
                        const isAdmin = info.adminIDs?.some(admin => admin.id === userID);
                        resolve(isAdmin);
                    }
                });
            });
        };

        try {
            // Require reply
            if (!event.messageReply) {
                api.sendMessage("⚠️ Reply to a message to delete it", event.threadID);
                return;
            }

            const botID = api.getCurrentUserID();
            const messageID = event.messageReply.messageID;
            const senderID = event.messageReply.senderID;
            
            // Permission checks
            const isAdmin = await checkPermissions(event.threadID, event.senderID);
            const canDelete = 
                senderID === botID || // Bot's message
                senderID === event.senderID || // Own message
                isAdmin; // Admin in group

            if (!canDelete) {
                api.sendMessage("⚠️ You can only delete your own messages or bot messages", event.threadID);
                return;
            }

            // Attempt deletion
            api.unsendMessage(messageID, (err) => {
                if (err) {
                    console.error("Delete Error:", err);
                    api.sendMessage("❌ Cannot delete this message - it may be too old or already deleted", event.threadID);
                }
            });

        } catch (err) {
            console.error("Delete Command Error:", err);
            api.sendMessage("❌ Error while deleting message", event.threadID);
        }
    }
};
