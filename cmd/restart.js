const { spawn } = require('child_process');
const Logger = require('../utils/log.js');

module.exports = {
    name: "restart",
    aliases: ["reboot", "reload"],
    description: "Restart bot secara otomatis",
    usage: "/restart",
    author: "Edinst",
    cooldown: 5,
    role: 2,
    execute: async function(api, event, args) {
        try {
            await api.sendMessage("🔄 Bot akan direstart dalam 3 detik...", event.threadID);
            
            setTimeout(async () => {
                try {
                    // Spawn new process
                    const child = spawn('npm', ['start'], {
                        cwd: process.cwd(),
                        detached: true,
                        stdio: 'inherit',
                        shell: true
                    });
                    
                    child.unref();
                    
                    // Exit current process
                    process.exit(0);
                } catch (spawnError) {
                    Logger.error('Restart error:', spawnError);
                    api.sendMessage("❌ Gagal merestart bot", event.threadID);
                }
            }, 3000);
        } catch (error) {
            Logger.error("Error in restart command:", error);
            api.sendMessage("❌ Gagal merestart bot: " + error.message, event.threadID);
        }
    }
};
