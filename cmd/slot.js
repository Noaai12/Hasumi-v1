module.exports = {
    name: "slot",
    aliases: ["spin"],
    description: "Bermain slot machine",
    usage: "/slot <jumlah_taruhan>",
    author: "Edinst",
    cooldown: 10,
    role: 0,
    execute: async function(api, event, args) {
        try {
            const bet = parseInt(args[0]);
            if (!bet || isNaN(bet) || bet < 1) {
                return api.sendMessage("❌ Masukkan jumlah taruhan yang valid!\nContoh: /slot 100", event.threadID);
            }

            const uid = event.senderID;
            if (!global.userData[uid]) {
                return api.sendMessage("❌ Data pengguna tidak ditemukan!", event.threadID);
            }

            const balance = Number(global.userData[uid].balance);
            if (balance < bet) {
                return api.sendMessage(`❌ Saldo tidak cukup!\nSaldo Anda: $${balance}`, event.threadID);
            }

            const slots = ["🍎", "🍊", "🍇", "🍓", "🍒", "7️⃣"];
            const slot1 = slots[Math.floor(Math.random() * slots.length)];
            const slot2 = slots[Math.floor(Math.random() * slots.length)];
            const slot3 = slots[Math.floor(Math.random() * slots.length)];

            let winMultiplier = 0;
            if (slot1 === slot2 && slot2 === slot3) {
                if (slot1 === "7️⃣") winMultiplier = 5;
                else winMultiplier = 3;
            } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
                winMultiplier = 1.5;
            }

            const winAmount = Math.floor(bet * winMultiplier);
            const newBalance = balance - bet + winAmount;
            global.userData[uid].balance = newBalance.toFixed(2);

            let message = `🎰 SLOT MACHINE 🎰\n\n`;
            message += `│ ${slot1} │ ${slot2} │ ${slot3} │\n\n`;
            
            if (winMultiplier > 0) {
                message += `🎉 Anda Menang $${winAmount}!\n`;
            } else {
                message += `😢 Anda Kalah $${bet}!\n`;
            }
            
            message += `💰 Saldo: $${newBalance.toFixed(2)}`;
            
            api.sendMessage(message, event.threadID);
            
            // Simpan perubahan
            await global.saveUserData();
        } catch (error) {
            console.error("Error in slot command:", error);
            api.sendMessage("❌ Terjadi kesalahan saat bermain slot.", event.threadID);
        }
    }
};
