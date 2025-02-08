const os = require('os');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const speedTest = require('speedtest-net');

module.exports = {
    name: "system",
    aliases: ["sys"],
    description: "Menampilkan informasi sistem bot",
    usage: "/system",
    author: "Edinst",
    cooldown: 30,
    role: 2,
    execute: async function(api, event, args) {
        try {
            // Kirim pesan awal
            const loadingMsg = await new Promise((resolve) => {
                api.sendMessage("⏳ Mengumpulkan informasi sistem...", event.threadID, (err, info) => {
                    resolve(info);
                });
            });

            // Buat canvas
            const canvas = createCanvas(600, 400);
            const ctx = canvas.getContext('2d');

            // Background dengan gradient
            const gradient = ctx.createLinearGradient(0, 0, 600, 400);
            gradient.addColorStop(0, '#1a1a1a');
            gradient.addColorStop(1, '#2d2d2d');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 600, 400);

            // Header
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(20, 50);
            ctx.lineTo(580, 50);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px Arial';
            ctx.fillText('SYSTEM INFO', 30, 35);

            // Informasi System
            ctx.font = '20px Arial';
            const infoY = 90;
            const spacing = 35;
            let currentY = infoY;

            // Function untuk menambah text
            const addText = (label, value) => {
                ctx.fillStyle = '#3498db';
                ctx.fillText(label, 30, currentY);
                ctx.fillStyle = '#ffffff';
                ctx.fillText(value, 200, currentY);
                currentY += spacing;
            };

            // CPU Info
            const cpuModel = os.cpus()[0].model;
            const cpuSpeed = (os.cpus()[0].speed / 1000).toFixed(2);
            const cpuCores = os.cpus().length;
            const cpuUsage = process.cpuUsage();
            const cpuPercent = ((cpuUsage.user + cpuUsage.system) / 1000000).toFixed(2);

            // Memory Info
            const totalMem = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
            const freeMem = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
            const usedMem = (totalMem - freeMem).toFixed(2);
            const memPercent = ((usedMem / totalMem) * 100).toFixed(2);

            // Uptime
            const uptime = os.uptime();
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor((uptime % 86400) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const uptimeStr = `${days}d ${hours}h ${minutes}m`;

            // Platform Info
            const platform = `${os.type()} ${os.release()}`;
            const hostname = os.hostname();

            // Speed Test
            let downloadSpeed = "Testing...";
            let uploadSpeed = "Testing...";
            try {
                const speed = await speedTest({acceptLicense: true, acceptGdpr: true});
                downloadSpeed = (speed.download.bandwidth / 125000).toFixed(2); // Convert to Mbps
                uploadSpeed = (speed.upload.bandwidth / 125000).toFixed(2); // Convert to Mbps
            } catch (error) {
                console.error("Speed test error:", error);
                downloadSpeed = "Failed";
                uploadSpeed = "Failed";
            }

            // Tambahkan semua informasi
            addText('CPU:', cpuModel);
            addText('CPU Cores:', `${cpuCores} cores @ ${cpuSpeed}GHz`);
            addText('CPU Usage:', `${cpuPercent}%`);
            addText('Memory:', `${usedMem}GB / ${totalMem}GB (${memPercent}%)`);
            addText('Platform:', platform);
            addText('Hostname:', hostname);
            addText('Uptime:', uptimeStr);
            addText('Download:', `${downloadSpeed} Mbps`);
            addText('Upload:', `${uploadSpeed} Mbps`);

            // Border
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 3;
            ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

            // Simpan dan kirim gambar
            const tempDir = path.join(process.cwd(), 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            const tempPath = path.join(tempDir, `system_info.png`);
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(tempPath, buffer);

            // Hapus pesan loading
            api.unsendMessage(loadingMsg.messageID);

            // Kirim hasil
            api.sendMessage(
                {
                    body: "🖥️ System Information",
                    attachment: fs.createReadStream(tempPath)
                },
                event.threadID,
                () => {
                    try {
                        fs.unlinkSync(tempPath);
                    } catch (err) {
                        console.error("Error deleting temp file:", err);
                    }
                }
            );

        } catch (error) {
            console.error("Error in system command:", error);
            api.sendMessage("❌ Terjadi kesalahan saat mengambil informasi sistem.", event.threadID);
        }
    }
}; 