const { readFileSync, writeFileSync } = require('fs');

module.exports = {
    name: "daily",
    aliases: ["claim"],
    description: "Klaim hadiah harian",
    usage: "/daily",
    author: "Edinst",
    cooldown: 86400, // 24 jam dalam detik
    role: 0,
    execute: async function(api, event, args) {
        try {
            const uid = event.senderID;
            const reward = Math.floor(Math.random() * 10) + 1; // Jumlah hadiah harian random antara 1 dan 10

            // Cek apakah user ada di database
            if (!global.userData[uid]) {
                return api.sendMessage("❌ Data pengguna tidak ditemukan!", event.threadID);
            }

            // Update balance user
            const currentBalance = parseFloat(global.userData[uid].balance);
            global.userData[uid].balance = (currentBalance + reward).toFixed(2);

            // Simpan ke file
            try {
                const fs = require("fs");
                fs.writeFileSync("./userdata.json", JSON.stringify(global.userData, null, 2));
                
                // Kirim pesan sukses
                return api.sendMessage(
                    `✅ Berhasil mengklaim hadiah harian!\n` +
                    `💰 Hadiah: $${reward}\n` +
                    `💵 Saldo sekarang: $${global.userData[uid].balance}`,
                    event.threadID
                );
            } catch (saveError) {
                console.error("Error saat menyimpan data:", saveError);
                return api.sendMessage("❌ Terjadi kesalahan saat menyimpan data hadiah.", event.threadID);
            }

        } catch (error) {
            console.error("Error dalam command daily:", error);
            return api.sendMessage("❌ Terjadi kesalahan saat mengeksekusi command daily.", event.threadID);
        }
    }
};