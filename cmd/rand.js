module.exports = {
    name: "rand",
    aliases: ["random"],
    description: "Mengirim kata atau angka random",
    usage: "/rand <text1>, <text2>, ... atau /rand <nomor1>-<nomor2>",
    author: "Edinst",
    cooldown: 5,
    role: 0,
    price: 0,
    execute: async function(api, event, args) {
        try {
            if (args.length === 0) {
                return api.sendMessage("❌ Usage: /rand <text1>, <text2>, ... atau /rand <nomor1>-<nomor2>", event.threadID);
            }

            const input = args.join(" ");
            if (input.includes(",")) {
                const options = input.split(",").map(opt => opt.trim());
                if (options.length < 2 || options.length > 10) {
                    return api.sendMessage("❌ Minimal 2 text dan maksimal 10 text.", event.threadID);
                }
                const randomText = options[Math.floor(Math.random() * options.length)];
                return api.sendMessage(`🎲 Random Text: ${randomText}`, event.threadID);
            } else if (input.includes("-")) {
                const [start, end] = input.split("-").map(num => parseInt(num.trim(), 10));
                if (isNaN(start) || isNaN(end) || start >= end) {
                    return api.sendMessage("❌ Format nomor tidak valid. Gunakan: /rand <nomor1>-<nomor2>", event.threadID);
                }
                const randomNumber = Math.floor(Math.random() * (end - start + 1)) + start;
                return api.sendMessage(`🎲 Random Number: ${randomNumber}`, event.threadID);
            } else {
                return api.sendMessage("❌ Format tidak valid. Gunakan: /rand <text1>, <text2>, ... atau /rand <nomor1>-<nomor2>", event.threadID);
            }
        } catch (error) {
            console.error("Error in rand command:", error);
            api.sendMessage("❌ Terjadi kesalahan saat menjalankan perintah rand.", event.threadID);
        }
    }
};
