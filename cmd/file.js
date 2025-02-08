const fs = require('fs');
const path = require('path');

module.exports = {
    name: "file",
    aliases: [],
    description: "Mengelola file sistem bot",
    usage: "/file <list|read|write> [path] [content]",
    author: "Edinst",
    cooldown: 5,
    role: 2,
    execute: async function(api, event, args) {
        const usage = `📝 Panduan Penggunaan Command File:
        
1️⃣ Menambah File:
/file add <nama_file> | <direktori> | <isi_file>
Contoh: /file add test.txt | folder/cmd | ini adalah isi file

2️⃣ Menghapus File:
/file del <nama_file> | <direktori>
Contoh: /file del test.txt | folder/cmd

3️⃣ Lihat Isi File:
/file show <nama_file> | <direktori>
Contoh: /file show test.txt | folder/cmd`;

        // Jika tidak ada argumen, tampilkan panduan
        if (!args[0]) {
            return api.sendMessage(usage, event.threadID);
        }

        const action = args[0].toLowerCase();
        const params = args.slice(1).join(' ').split('|').map(item => item.trim());

        if (action === 'add') {
            if (params.length !== 3) return api.sendMessage(usage, event.threadID);

            const [fileName, directory, content] = params;
            
            try {
                if (!fs.existsSync(directory)) {
                    fs.mkdirSync(directory, { recursive: true });
                }

                const filePath = path.join(directory, fileName);
                fs.writeFileSync(filePath, content);
                
                return api.sendMessage(`✅ Berhasil membuat file:\n${filePath}`, event.threadID);
            } catch (err) {
                console.error(err);
                return api.sendMessage('❌ Gagal membuat file: ' + err.message, event.threadID);
            }
        } 
        else if (action === 'del') {
            if (params.length !== 2) return api.sendMessage(usage, event.threadID);

            const [fileName, directory] = params;
            
            try {
                const filePath = path.join(directory, fileName);
                
                if (!fs.existsSync(filePath)) {
                    return api.sendMessage('❌ File tidak ditemukan!', event.threadID);
                }

                fs.unlinkSync(filePath);
                return api.sendMessage(`✅ Berhasil menghapus file:\n${filePath}`, event.threadID);
            } catch (err) {
                console.error(err);
                return api.sendMessage('❌ Gagal menghapus file: ' + err.message, event.threadID);
            }
        }
        else if (action === 'show') {
            if (params.length !== 2) return api.sendMessage(usage, event.threadID);

            const [fileName, directory] = params;
            
            try {
                const filePath = path.join(directory, fileName);
                
                if (!fs.existsSync(filePath)) {
                    return api.sendMessage('❌ File tidak ditemukan!', event.threadID);
                }

                const content = fs.readFileSync(filePath, 'utf8');
                return api.sendMessage(`📄 Isi file ${fileName}:\n\n${content}`, event.threadID);
            } catch (err) {
                console.error(err);
                return api.sendMessage('❌ Gagal membaca file: ' + err.message, event.threadID);
            }
        }
        else {
            return api.sendMessage(usage, event.threadID);
        }
    }
}; 