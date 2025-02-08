const fs = require("fs");
const { createCanvas } = require('canvas');
const path = require('path');

module.exports = {
    name: "profile",
    aliases: ["info", "status", "me"],
    description: "Menampilkan profil pengguna",
    usage: "/profile [id]",
    author: "Edinst",
    cooldown: 5,
    role: 0,
    price: 1.5, // Harga command profile 1.5$
    execute: async function(api, event, args) {
        try {
            const uid = event.senderID;  // ID pengirim perintah

            // Cek format command dan tentukan target ID
            let targetID;
            if (args.length === 0) {
                targetID = uid;  // Jika tidak ada ID yang diberikan, tampilkan profil diri sendiri
            } else {
                // Cari user berdasarkan ID numerik yang diberikan
                const searchID = parseInt(args[0]);
                const foundUserEntry = Object.entries(global.userData).find(([_, user]) => user.id === searchID);
                
                if (!foundUserEntry) {
                    return api.sendMessage("❌ ID pengguna tidak ditemukan.", event.threadID);
                }
                targetID = foundUserEntry[0];
            }

            // Gunakan global.userData langsung
            if (!global.userData[targetID]) {
                return api.sendMessage("❌ Data pengguna tidak ditemukan.", event.threadID);
            }

            const user = global.userData[targetID];
            
            // Cek nickname dari nickname.json
            let displayName = user.name;
            try {
                if (fs.existsSync('./nickname.json')) {
                    const nickData = JSON.parse(fs.readFileSync('./nickname.json', 'utf8'));
                    if (nickData[targetID]) {
                        displayName = nickData[targetID];
                    }
                }
            } catch (error) {
                console.error("Error reading nickname:", error);
            }

            // Membuat canvas untuk status card
            const canvas = createCanvas(700, 450);
            const ctx = canvas.getContext('2d');

            // Gradient background
            const gradient = ctx.createLinearGradient(0, 0, 700, 450);
            gradient.addColorStop(0, '#1e3c72');
            gradient.addColorStop(0.5, '#2a5298');
            gradient.addColorStop(1, '#3a7bd5');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 700, 450);

            // Garis-garis diagonal
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            for (let i = -200; i < 800; i += 25) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i + 300, 450);
                ctx.stroke();
            }

            // Border dengan shadow
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 20;
            ctx.strokeRect(15, 15, 670, 420);
            ctx.shadowBlur = 0;

            // Header text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#34ace0';
            ctx.shadowBlur = 15;
            ctx.fillText('USER STATUS', 350, 50);
            ctx.shadowBlur = 0;

            // Informasi pengguna
            ctx.font = '20px Arial';
            ctx.textAlign = 'left';
            const labels = ['UID', 'ID', 'Name', 'Level', 'EXP', 'Balance', 'Messages'];
            const values = [
                targetID,
                user.id || "Unknown",
                displayName,
                user.level || "Newbie",
                Number(user.exp || 0).toFixed(1),
                `$${Number(user.balance || 0).toFixed(2)}`,
                user.totalMessages || 0
            ];

            const startX = 50;
            const startY = 120;
            const spacingY = 45;

            // Menulis informasi ke canvas
            labels.forEach((label, index) => {
                ctx.fillStyle = '#34ace0';
                ctx.fillText(`${label}:`, startX, startY + spacingY * index);
                ctx.fillStyle = '#ffffff';
                ctx.fillText(values[index], startX + 160, startY + spacingY * index);
            });

            // Footer text
            ctx.font = 'italic 18px Arial';
            ctx.fillStyle = '#f1f2f6';
            ctx.textAlign = 'center';
            ctx.fillText('Designed and Created by Edinst © 2024', 350, 420);

            // Convert canvas to buffer (gambar)
            const buffer = canvas.toBuffer('image/png');

            // Simpan gambar sementara
            const tempDir = path.join(process.cwd(), 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const tempPath = path.join(tempDir, `${targetID}_status.png`);
            fs.writeFileSync(tempPath, buffer);

            // Kirim gambar sebagai response
            api.sendMessage(
                {
                    body: "🎴 Status Card",
                    attachment: fs.createReadStream(tempPath)
                },
                event.threadID,
                () => {
                    try {
                        fs.unlinkSync(tempPath);  // Hapus gambar sementara setelah terkirim
                    } catch (err) {
                        console.error("Error deleting temp file:", err);
                    }
                }
            );
        } catch (error) {
            console.error("Error in profile command:", error);
            api.sendMessage("❌ Terjadi kesalahan saat membuat status card.", event.threadID);
        }
    }
};
