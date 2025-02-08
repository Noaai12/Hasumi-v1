module.exports = {
    name: "tempmail",
    aliases: ["tm"],
    description: "Membuat email sementara",
    usage: "/tempmail",
    author: "Edinst",
    cooldown: 5,
    role: 0,
    execute: async function(api, event, args) {
        try {
            // Bisa menggunakan API dari 1secmail atau layanan tempmail lainnya
            const response = await fetch('https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1');
            const [email] = await response.json();

            const message = `📧 Email Sementara
╭────────────────
│ Email: ${email}
│ Aktif selama: 10 menit
│
│ Gunakan command:
│ /tempmail check - cek inbox
╰────────────────`;

            api.sendMessage(message, event.threadID);

        } catch (error) {
            console.error("Error in tempmail command:", error);
            api.sendMessage("❌ Terjadi kesalahan saat membuat email sementara.", event.threadID);
        }
    }
};
