module.exports = {
    name: "tid",
    aliases: ["threadid"],
    description: "Menampilkan ID thread saat ini",
    usage: "/tid",
    author: "Edinst",
    cooldown: 5,
    role: 0,
    execute: async function(api, event, args) {
        try {
            const threadID = event.threadID;
            
            api.getThreadInfo(threadID, (err, info) => {
                if (err) {
                    console.error("Error getting thread info:", err);
                    return api.sendMessage("❌ Terjadi kesalahan saat mengambil informasi grup.", event.threadID);
                }

                const response = `📋 Informasi Grup
╭────────────────
│ Nama: ${info.threadName || "Tidak ada nama"}
│ Thread ID: ${threadID}
│ Jumlah Anggota: ${info.participantIDs.length}
╰────────────────`;

                api.sendMessage(response, event.threadID);
            });

        } catch (error) {
            console.error("Error in tid command:", error);
            api.sendMessage("❌ Terjadi kesalahan saat mengambil TID.", event.threadID);
        }
    }
};