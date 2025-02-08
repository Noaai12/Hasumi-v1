module.exports = {
    name: "bin",
    aliases: ["pastebin"],
    description: "Upload cmd ke Pastebin",
    usage: "/bin <nama_command>",
    author: "Edinst",
    cooldown: 10,
    role: 2,
    execute: async function(api, event, args) {
        try {
            const fs = require("fs");
            const PastebinAPI = require('pastebin-js');
            
            const pastebin = new PastebinAPI({
                api_dev_key: '9L5zZMsy2tHDX21hme04z2M6UtN7zRdX',
                api_user_name: 'edinst03',
                api_user_password: 'Edinst08771661'
            });

            if (args.length !== 1) {
                return api.sendMessage("⚠️ Format: /bin [nama_command]\nContoh: /bin help", event.threadID);
            }

            const commandName = args[0].toLowerCase();
            const filePath = `./cmd/${commandName}.js`;

            try {
                if (!fs.existsSync(filePath)) {
                    return api.sendMessage(`❌ Command "${commandName}" tidak ditemukan!`, event.threadID);
                }

                const fileContent = fs.readFileSync(filePath, 'utf8');

                try {
                    const url = await pastebin.createPaste({
                        text: fileContent,
                        title: `${commandName}.js`,
                        format: 'javascript',
                        privacy: 1,
                        expiration: '1D'
                    });

                    const response = `✅ Berhasil upload ke Pastebin!\n\n` +
                                   `📁 File: ${commandName}.js\n` +
                                   `🔗 Link: ${url}\n` +
                                   `⏱️ Expired: 1 hari`;

                    api.sendMessage(response, event.threadID);

                } catch (uploadError) {
                    console.error('Error uploading to Pastebin:', uploadError);
                    api.sendMessage("❌ Gagal mengupload ke Pastebin", event.threadID);
                }

            } catch (readError) {
                console.error('Error reading file:', readError);
                api.sendMessage("❌ Gagal membaca file command", event.threadID);
            }

        } catch (error) {
            console.error('Error in bin command:', error);
            api.sendMessage("❌ Terjadi kesalahan dalam command bin", event.threadID);
        }
    }
}; 