module.exports = {
    name: "pay",
    aliases: ["transfer", "tf"],
    description: "Transfer uang ke pengguna lain (Biaya admin: 2%)",
    usage: "/pay <id> <jumlah>",
    author: "Edinst",
    cooldown: 10,
    role: 0,
    execute: async function(api, event, args) {
        try {
            const fs = require("fs");
            const uid = event.senderID;
            
            // Cek format command
            if (args.length !== 2) {
                return api.sendMessage("⚠️ Format: /pay [id] [jumlah]\nContoh: /pay 1 1000", event.threadID);
            }

            // Parse arguments
            const targetID = args[0];
            const amount = parseFloat(args[1]);

            // Validasi jumlah transfer
            if (!amount || isNaN(amount) || amount <= 0) {
                return api.sendMessage("❌ Jumlah transfer harus berupa angka positif!", event.threadID);
            }

            // Minimal transfer
            if (amount < 5) {
                return api.sendMessage("❌ Minimal transfer adalah $5!", event.threadID);
            }

            try {
                // Cek pengirim
                if (!global.userData[uid]) {
                    return api.sendMessage("❌ Data pengirim tidak ditemukan!", event.threadID);
                }

                // Cek penerima berdasarkan ID
                const receiverID = Object.keys(global.userData).find(key => global.userData[key].id == targetID);
                if (!receiverID) {
                    return api.sendMessage("❌ User ID penerima tidak ditemukan!", event.threadID);
                }

                // Hitung biaya admin (2%)
                const adminFee = amount * 0.02;
                const totalCost = amount + adminFee;

                // Cek balance pengirim
                const senderBalance = Number(global.userData[uid].balance);
                if (senderBalance < totalCost) {
                    return api.sendMessage(`❌ Saldo tidak cukup!\nJumlah transfer: $${amount}\nBiaya admin (2%): $${adminFee.toFixed(2)}\nTotal biaya: $${totalCost.toFixed(2)}\nSaldo Anda: $${senderBalance.toFixed(2)}`, event.threadID);
                }

                try {
                    // Update balance pengirim (dikurangi amount + fee)
                    global.userData[uid].balance = (senderBalance - totalCost).toFixed(2);

                    // Update balance penerima (ditambah amount saja)
                    const receiverBalance = Number(global.userData[receiverID].balance);
                    global.userData[receiverID].balance = (receiverBalance + amount).toFixed(2);

                    try {
                        // Simpan perubahan ke file
                        const formattedData = {};
                        Object.keys(global.userData).forEach(id => {
                            if (global.userData[id]) {
                                formattedData[id] = {
                                    name: global.userData[id].name || "Unknown User",
                                    balance: Number(global.userData[id].balance).toFixed(2),
                                    exp: Number(global.userData[id].exp).toFixed(1),
                                    level: global.userData[id].level || "newbie",
                                    totalMessages: Number(global.userData[id].totalMessages || 0)
                                };
                            }
                        });
                        
                        fs.writeFileSync("./userdata.json", JSON.stringify(formattedData, null, 2));

                        try {
                            // Cek nickname untuk pengirim dan penerima
                            let senderName = global.userData[uid].name;
                            let receiverName = global.userData[receiverID].name;
                            
                            try {
                                if (fs.existsSync('./nickname.json')) {
                                    const nickData = JSON.parse(fs.readFileSync('./nickname.json', 'utf8'));
                                    if (nickData[uid]) {
                                        senderName = nickData[uid];
                                    }
                                    if (nickData[receiverID]) {
                                        receiverName = nickData[receiverID];
                                    }
                                }
                            } catch (nickError) {
                                console.error("Error reading nickname:", nickError);
                            }

                            // Kirim notifikasi ke pengirim
                            const senderMsg = `✅ Berhasil transfer ke ${receiverName}!\n` +
                                            `💸 Jumlah transfer: $${amount}\n` +
                                            `💰 Biaya admin (2%): $${adminFee.toFixed(2)}\n` +
                                            `💵 Total biaya: $${totalCost.toFixed(2)}\n` +
                                            `🏦 Sisa saldo: $${global.userData[uid].balance}`;
                            api.sendMessage(senderMsg, event.threadID);

                            // Kirim notifikasi ke penerima
                            const receiverMsg = `💌 Anda menerima transfer dari ${senderName}!\n` +
                                              `💸 Jumlah: $${amount}\n` +
                                              `🏦 Saldo sekarang: $${global.userData[receiverID].balance}`;
                            api.sendMessage(receiverMsg, receiverID);

                        } catch (notifError) {
                            console.error('Error sending notifications:', notifError);
                            api.sendMessage("❌ Transfer berhasil tapi gagal mengirim notifikasi", event.threadID);
                        }

                    } catch (saveError) {
                        console.error('Error saving data:', saveError);
                        api.sendMessage("❌ Terjadi kesalahan saat menyimpan data", event.threadID);
                        return;
                    }

                } catch (updateError) {
                    console.error('Error updating balances:', updateError);
                    api.sendMessage("❌ Terjadi kesalahan saat update saldo", event.threadID);
                    return;
                }

            } catch (validationError) {
                console.error('Error in validation:', validationError);
                api.sendMessage("❌ Terjadi kesalahan saat validasi data", event.threadID);
                return;
            }

        } catch (error) {
            console.error('Error in pay command:', error);
            api.sendMessage("❌ Terjadi kesalahan dalam command pay", event.threadID);
            return;
        }
    }
}; 