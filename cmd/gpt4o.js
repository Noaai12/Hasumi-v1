const axios = require('axios');

module.exports = {
    name: "gpt4o",
    aliases: ["ai", "ask"],
    description: "Bertanya kepada AI GPT-4",
    usage: "/gpt4o <pertanyaan>",
    author: "Edinst",
    cooldown: 5,
    role: 0,
    price: 2, // Harga command gpt4o 2$
    execute: async function(api, event, args) {
        try {
            if (args.length === 0) {
                return api.sendMessage("❌ Mohon masukkan pertanyaan!", event.threadID, event.messageID);
            }

            const query = args.join(' ');
            const uid = event.senderID;

            const response = await axios.get(`https://kaiz-apis.gleeze.com/api/gpt-4o?q=${encodeURIComponent(query)}&uid=${uid}`);
            const reply = response.data.response;

            if (reply) {
                api.sendMessage(reply, event.threadID);
            } else {
                api.sendMessage('❌ Gagal mendapatkan respon dari API.', event.threadID);
            }

        } catch (error) {
            console.error('Error in gpt4o command:', error);
            api.sendMessage(`❌ Terjadi kesalahan saat mengakses API: ${error}`, event.threadID);
        }
    }
};
