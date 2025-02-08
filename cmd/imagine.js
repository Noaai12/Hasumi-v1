const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "imagine",
    aliases: [],
    description: "Membuat gambar imajinasi",
    usage: "/imagine (prompt)",
    author: "Edinst",
    cooldown: 5,
    role: 0,
    price: 5,
    execute: async function(api, event, args) {
        try {
            const prompt = args.join(' ');
            const response = await axios.get(`https://kaiz-apis.gleeze.com/api/imagine-v2?prompt=${encodeURIComponent(prompt)}`, {
                responseType: 'arraybuffer'
            });

            const imageBuffer = Buffer.from(response.data, 'binary');
            const imagePath = path.join(__dirname, 'image.jpg');

            fs.writeFileSync(imagePath, imageBuffer);

            api.sendMessage({
                body: "Here's your generated image:",
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, (err) => {
                if (err) {
                    console.error('Error:', err);
                    api.sendMessage('Failed to send the image.', event.threadID);
                }
                fs.unlinkSync(imagePath); // Remove the file after sending the message
            });

        } catch (error) {
            console.error('Error:', error);
            api.sendMessage(`Terjadi kesalahan saat mengakses API: ${error}`, event.threadID);
        }
    }
};