const fs = require('fs');

module.exports = {
    name: "setn",
    aliases: ["setnick", "nickname"],
    description: "Set nickname (max 15 karakter, hanya huruf dan angka)",
    usage: "/setn <nickname>",
    author: "Edinst",
    cooldown: 10,
    role: 0,
    execute: async function(api, event, args) {
        try {
            const uid = event.senderID;

            // Cek format command
            if (args.length === 0) {
                return api.sendMessage("⚠️ Format: /setn <nickname>\nContoh: /setn Edinst123", event.threadID);
            }

            // Gabungkan semua args menjadi satu nickname
            const newNick = args.join("");

            // Validasi panjang nickname
            if (newNick.length > 15) {
                return api.sendMessage("❌ Nickname maksimal 15 karakter!", event.threadID);
            }

            // Validasi karakter (hanya huruf dan angka)
            const validPattern = /^[a-zA-Z0-9]+$/;
            if (!validPattern.test(newNick)) {
                return api.sendMessage("❌ Nickname hanya boleh mengandung huruf dan angka!", event.threadID);
            }

            // Baca file nickname.json atau buat baru jika belum ada
            let nickData = {};
            try {
                if (fs.existsSync('./nickname.json')) {
                    const data = fs.readFileSync('./nickname.json', 'utf8');
                    nickData = JSON.parse(data);
                }
            } catch (error) {
                console.error("Error reading nickname file:", error);
            }

            // Update nickname
            nickData[uid] = newNick;

            try {
                // Simpan ke file
                fs.writeFileSync('./nickname.json', JSON.stringify(nickData, null, 2));
                
                return api.sendMessage(
                    `✅ Berhasil mengubah nickname!\n` +
                    `📝 Nickname baru: ${newNick}`,
                    event.threadID
                );
            } catch (saveError) {
                console.error("Error saving nickname:", saveError);
                return api.sendMessage("❌ Terjadi kesalahan saat menyimpan nickname.", event.threadID);
            }

        } catch (error) {
            console.error("Error in setn command:", error);
            return api.sendMessage("❌ Terjadi kesalahan saat mengeksekusi command setn.", event.threadID);
        }
    }
};
