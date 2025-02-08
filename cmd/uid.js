module.exports = {
    name: "uid",
    aliases: ["id", "getid"],
    description: "Get user ID from reply/mention/self",
    usage: "{prefix}uid [reply/mention]",
    cooldown: 3,
    async execute(api, event, args) {
        // Helper function to get user info
        const getUserInfo = async (userID) => {
            return new Promise((resolve) => {
                api.getUserInfo(userID, (err, info) => {
                    if (err || !info[userID]) {
                        resolve({ userID: userID, name: "Unknown" });
                    } else {
                        resolve({
                            userID: userID,
                            name: info[userID].name,
                            isVerified: info[userID].isVerified,
                            profileUrl: info[userID].profileUrl
                        });
                    }
                });
            });
        };

        try {
            let response = "";

            // Case 1: Reply to message
            if (event.messageReply) {
                const info = await getUserInfo(event.messageReply.senderID);
                response = `👤 Name: ${info.name}\n🆔 UID: ${info.userID}`;
                if (info.isVerified) response += "\n✓ Verified Account";
            }
            // Case 2: Mentioned users
            else if (Object.keys(event.mentions || {}).length > 0) {
                const mentions = Object.entries(event.mentions);
                const results = await Promise.all(
                    mentions.map(async ([id, tag]) => {
                        const info = await getUserInfo(id);
                        return `👤 Name: ${info.name}\n🆔 UID: ${id}`;
                    })
                );
                response = results.join("\n\n");
            }
            // Case 3: Self info
            else {
                const info = await getUserInfo(event.senderID);
                response = `👤 Name: ${info.name}\n🆔 UID: ${info.userID}`;
                if (info.isVerified) response += "\n✓ Verified Account";
            }

            // Send response
            api.sendMessage(response, event.threadID, (err) => {
                if (err) api.sendMessage("Error sending UID response:", err, event.threadID);
            });

        } catch (err) {
            console.error("UID Command Error:", err);
            api.sendMessage("❌ Error getting user information", event.threadID);
        }
    }
};
