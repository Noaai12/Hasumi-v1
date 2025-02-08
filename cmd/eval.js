module.exports = {
    name: "eval",
    aliases: ["ev"],
    description: "Menjalankan kode JavaScript",
    usage: "/eval <code>",
    author: "Edinst",
    cooldown: 0,
    role: 2,
    execute: async function(api, event, args) {
        if (!config.owner.includes(event.author.id)) 
            return api.sendMessage('Anda tidak memiliki izin untuk menggunakan perintah ini!', event.threadID);

        try {
            const code = args.join(" ");
            let evaled = eval(code);

            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);

            api.sendMessage(clean(evaled), event.threadID);
            
        } catch (err) {
            api.sendMessage(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``, event.threadID);
            console.error('Error pada perintah eval:', err);
        }
    }
};
