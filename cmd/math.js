module.exports = {
    name: "math",
    aliases: ["calculate", "calc"],
    description: "Melakukan operasi aritmatika dasar",
    usage: "/math <nomor1><operator><nomor2>",
    author: "Edinst",
    cooldown: 5,
    role: 0,
    price: 0,
    execute: async function(api, event, args) {
        try {
            if (args.length !== 1) {
                return api.sendMessage("❌ Usage: /math <nomor1><operator><nomor2>", event.threadID);
            }

            const input = args[0];
            const match = input.match(/^(\d+[\+\-\*\/×÷]\d+)+$/);

            if (!match) {
                return api.sendMessage("❌ Format tidak valid. Gunakan /math <nomor1><operator><nomor2>", event.threadID);
            }

            let result;
            try {
                result = eval(input.replace(/×/g, '*').replace(/÷/g, '/'));
            } catch (e) {
                return api.sendMessage("❌ Terjadi kesalahan dalam perhitungan.", event.threadID);
            }

            return api.sendMessage(`📊 Hasil: ${result}`, event.threadID);
        } catch (error) {
            console.error("Error in math command:", error);
            api.sendMessage("❌ Terjadi kesalahan saat menjalankan perintah math.", event.threadID);
        }
    }
};
