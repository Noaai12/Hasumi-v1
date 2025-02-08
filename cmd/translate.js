module.exports = {
    name: "translate",
    aliases: ["tr", "tl"],
    description: "Menerjemahkan teks ke bahasa yang diinginkan",
    usage: "/translate <kode_bahasa> <teks>",
    author: "Edinst",
    cooldown: 5,
    role: 0,
    price: 0.5, // Harga command translate 0.5$
    execute: async function(api, event, args) {
        try {
            // Import modul translate
            const translate = require('translate-google');

            // Cek format command
            if (args.length < 2) {
                return api.sendMessage("⚠️ Format: /translate [kode_bahasa] [teks]\nContoh: /translate id hello world\n\nKode bahasa umum:\n- id (Indonesia)\n- en (Inggris)\n- ja (Jepang)\n- ko (Korea)\n- ar (Arab)", event.threadID);
            }

            // Ambil kode bahasa dan teks
            const targetLang = args[0].toLowerCase();
            const textToTranslate = args.slice(1).join(" ");

            try {
                // Proses translate
                const result = await translate(textToTranslate, { to: targetLang });

                // Format pesan hasil
                const response = `🌐 Hasil Terjemahan:\n\n` +
                               `📝 Teks Asli: ${textToTranslate}\n` +
                               `📌 Terjemahan (${targetLang}):\n${result}`;

                // Kirim hasil terjemahan
                api.sendMessage(response, event.threadID);

            } catch (translateError) {
                console.error('Error translating:', translateError);
                
                // Cek apakah error karena kode bahasa tidak valid
                if (translateError.message.includes('language')) {
                    api.sendMessage("❌ Kode bahasa tidak valid! Gunakan kode bahasa yang benar (contoh: id, en, ja, ko, ar)", event.threadID);
                } else {
                    api.sendMessage("❌ Terjadi kesalahan saat menerjemahkan teks", event.threadID);
                }
            }

        } catch (error) {
            console.error('Error in translate command:', error);
            api.sendMessage("❌ Terjadi kesalahan dalam command translate", event.threadID);
        }
    }
}; 