const { exec } = require('child_process');

module.exports = {
    name: "shell",
    aliases: ["$", "terminal"],
    description: "Menjalankan perintah shell",
    usage: "/shell <command>",
    author: "Edinst",
    cooldown: 5,
    role: 2,
    execute: async function(api, event, args) {
        try {
            if (!args[0]) {
                return api.sendMessage("❌ Mohon masukkan perintah yang akan dijalankan!", event.threadID);
            }

            const command = args.join(" ");
            exec(command, (error, stdout, stderr) => {
                let response = `📝 Shell Command\n╭────────────────\n`;
                response += `│ Input: ${command}\n`;
                
                if (error) {
                    response += `│ Error: ${error.message}\n`;
                }
                if (stdout) {
                    response += `│ Output: ${stdout}\n`;
                }
                if (stderr) {
                    response += `│ StdErr: ${stderr}\n`;
                }
                
                response += `╰────────────────`;
                api.sendMessage(response, event.threadID);
            });
        } catch (error) {
            console.error("Error in shell command:", error);
            api.sendMessage("❌ Terjadi kesalahan saat menjalankan perintah.", event.threadID);
        }
    }
};
