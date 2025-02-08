"use strict";

module.exports = function(defaultFuncs, api, ctx) {
    return function processReply(event) {
        // Early return if not a reply
        if (!event.type || event.type !== "message_reply") return event;
        
        try {
            // Extract reply data
            const replyData = {
                messageID: event.messageReply.messageID,
                senderID: event.messageReply.senderID,
                threadID: event.messageReply.threadID || event.threadID,
                body: event.messageReply.body || "",
                timestamp: event.messageReply.timestamp,
                attachments: event.messageReply.attachments || []
            };

            // Add reply metadata to event
            event.isReply = true;
            event.replyData = replyData;
            event.replyToSelf = event.senderID === replyData.senderID;

            // Get sender info if available
            if (replyData.senderID) {
                api.getUserInfo(replyData.senderID, (err, info) => {
                    if (!err && info[replyData.senderID]) {
                        event.replyData.senderName = info[replyData.senderID].name;
                    }
                });
            }

            return event;
        } catch (err) {
            console.error("Reply Handler Error:", err);
            event.isReply = false;
            return event;
        }
    };
};
