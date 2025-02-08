module.exports = {
    name: "adduser",
    aliases: ["add"],
    description: "Menambahkan pengguna ke database",
    usage: "/adduser <uid>",
    author: "Edinst",
    cooldown: 5,
    role: 2,
    execute: async function(api, event, args) {
        try {
            // Cek apakah ada UID yang diberikan
            if (!args[0]) {
                return api.sendMessage("❌ Harap masukkan UID user yang ingin ditambahkan!\n\nContoh: .adduser 100000123456789", event.threadID);
            }

            const uid = args[0];
            
            // Validasi format UID
            if (!/^\d+$/.test(uid)) {
                return api.sendMessage("❌ Format UID tidak valid! UID harus berupa angka.", event.threadID);
            }

            // Coba tambahkan user ke grup
            api.addUserToGroup(uid, event.threadID, (err) => {
                if (err) {
                    console.error("Error adding user:", err);
                    let errorMessage = "❌ Gagal menambahkan user ke grup. ";
                    
                    // Handle specific error cases
                    if (err.error === 1545014) {
                        errorMessage += "User tidak ditemukan atau profile terlalu private.";
                    } else if (err.error === 1357031) {
                        errorMessage += "Bot tidak memiliki izin untuk menambahkan member.";
                    } else if (err.error === 1404) {
                        errorMessage += "User tidak dapat ditambahkan ke grup ini.";
                    } else {
                        errorMessage += "Silakan cek kembali UID dan pastikan bot adalah admin grup.";
                    }
                    
                    api.sendMessage(errorMessage, event.threadID);
                    return;
                }

                api.sendMessage(`✅ Berhasil menambahkan user dengan UID: ${uid} ke grup!`, event.threadID);
            });

        } catch (error) {
            console.error("Error in adduser command:", error);
            api.sendMessage("❌ Terjadi kesalahan saat menambahkan user ke grup", event.threadID);
        }
    }
}; 