module.exports = {
    name: "load",
    aliases: ["reload"],
    description: "Memuat ulang semua command",
    usage: "/load",
    author: "Edinst",
    cooldown: 5,
    role: 2,
    execute: async function(api, event, args) {
        try {
            // Hapus semua command dari cache
            Object.keys(require.cache).forEach(key => {
                if (key.includes('/cmd/')) {
                    delete require.cache[key];
                }
            });

            // Kosongkan global.commands terlebih dahulu
            global.commands = {};

            // Reload commands menggunakan fungsi global
            const commands = await global.loadCommands();
            
            // Hitung jumlah command unik (tanpa alias)
            const uniqueCommands = new Set();
            for (const [cmdName, cmd] of Object.entries(commands)) {
                if (cmd.name === cmdName) { // Hanya hitung command utama, bukan alias
                    uniqueCommands.add(cmd.name);
                }
            }

            const message = `✅ Berhasil memuat ulang semua command
╭─────────��──────
│ Status: Sukses
│ Total Command: ${uniqueCommands.size}
│ Waktu: ${new Date().toLocaleTimeString()}
╰────────────────

📝 Command yang dimuat:
${Array.from(uniqueCommands).sort().join(', ')}`;

            api.sendMessage(message, event.threadID);

        } catch (error) {
            console.error("Error in load command:", error);
            api.sendMessage("❌ Terjadi kesalahan saat memuat ulang command.", event.threadID);
        }
    }
}; 