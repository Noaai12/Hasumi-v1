const fs = require("fs");
const path = require("path");

const userDataPath = path.join(__dirname, "mineData.json");

const materials = [
    { id: 1, name: "Batu Biasa", emoji: "🪨", value: 10, rarity: "common" },
    { id: 2, name: "Tanah Liat", emoji: "🏺", value: 15, rarity: "common" },
    { id: 3, name: "Besi Tua", emoji: "🔩", value: 20, rarity: "common" },
    { id: 4, name: "Perak Murni", emoji: "🥈", value: 50, rarity: "rare" },
    { id: 5, name: "Kristal Kecil", emoji: "🔮", value: 75, rarity: "rare" },
    { id: 6, name: "Amber Kuno", emoji: "🟠", value: 100, rarity: "rare" },
    { id: 7, name: "Emas Padat", emoji: "🟡", value: 200, rarity: "epic" },
    { id: 8, name: "Diamond Mentah", emoji: "💎", value: 500, rarity: "epic" },
    { id: 9, name: "Meteorit", emoji: "☄️", value: 300, rarity: "epic" },
    { id: 10, name: "Star Fragment", emoji: "🌠", value: 1000, rarity: "legendary" },
    { id: 11, name: "Dragon Scale", emoji: "🐉", value: 1500, rarity: "legendary" },
    { id: 12, name: "Phoenix Feather", emoji: "🔥", value: 2000, rarity: "legendary" },
];

const shopItems = [
    { id: 101, name: "Basic Pickaxe", price: 500, effect: "+5% Rare chance" },
    { id: 102, name: "Lucky Charm", price: 2000, effect: "+2% Legendary chance (1 jam)" },
    { id: 103, name: "Mystery Box", price: 1000, effect: "Random 3-5 materials" },
];

function loadUserData() {
    try {
        return JSON.parse(fs.readFileSync(userDataPath));
    } catch {
        return {};
    }
}

function saveUserData(data) {
    fs.writeFileSync(userDataPath, JSON.stringify(data, null, 2));
}

module.exports = {
    name: "mine",
    aliases: ["mining"],
    description: "Menambang material dan melakukan transaksi.",
    usage: "{prefix}mine [jumlah] | inventory | sell [id] [jumlah] | shop | buy [id] [jumlah]",
    cooldown: 5,
    async execute(api, event, args) {
        const userId = event.senderID;
        const userData = loadUserData();
        const user = userData[userId] || { inventory: {}, balance: 1000 };

        switch (args[0]?.toLowerCase()) {
            case "inventory":
                let invText = "📦 Inventory:\n";
                Object.entries(user.inventory).forEach(([id, qty]) => {
                    const item = materials.find(m => m.id == id);
                    invText += `${item.emoji} ${item.name} x${qty} (Nilai: ${item.value})\n`;
                });
                invText += `💰 Balance: ${user.balance}`;
                api.sendMessage(invText, event.threadID);
                break;

            case "sell":
                const sellId = parseInt(args[1]);
                const sellQty = parseInt(args[2]) || 1;
                if (!user.inventory[sellId] || user.inventory[sellId] < sellQty) {
                    return api.sendMessage("❌ Barang tidak cukup!", event.threadID);
                }
                const sellItem = materials.find(m => m.id == sellId);
                user.inventory[sellId] -= sellQty;
                if (user.inventory[sellId] === 0) delete user.inventory[sellId];
                user.balance += sellItem.value * sellQty;
                api.sendMessage(`✅ Terjual ${sellQty}x ${sellItem.name} seharga ${sellItem.value * sellQty}`, event.threadID);
                break;

            case "shop":
                let shopText = "🛒 Mining Shop:\n";
                shopItems.forEach(item => {
                    shopText += `${item.id}. ${item.name} - ${item.price} (${item.effect})\n`;
                });
                api.sendMessage(shopText, event.threadID);
                break;

            case "buy":
                const buyId = parseInt(args[1]);
                const buyQty = parseInt(args[2]) || 1;
                const shopItem = shopItems.find(i => i.id == buyId);
                if (!shopItem) return api.sendMessage("❌ Item tidak ditemukan!", event.threadID);
                const totalCost = shopItem.price * buyQty;
                if (user.balance < totalCost) return api.sendMessage("❌ Uang tidak cukup!", event.threadID);
                user.balance -= totalCost;
                api.sendMessage(`✅ Berhasil membeli ${buyQty}x ${shopItem.name}!`, event.threadID);
                break;

            default:
                const mineQty = Math.min(parseInt(args[0]) || 1, 10);
                let minedItems = [];
                let totalValue = 0;
                for (let i = 0; i < mineQty; i++) {
                    const material = materials[Math.floor(Math.random() * materials.length)];
                    minedItems.push(`${material.emoji} ${material.name}`);
                    user.inventory[material.id] = (user.inventory[material.id] || 0) + 1;
                    totalValue += material.value;
                }
                api.sendMessage(`⛏️ Hasil Mining:\n${minedItems.join("\n")}\n💰 Total Nilai: ${totalValue}`, event.threadID);
                break;
        }

        userData[userId] = user;
        saveUserData(userData);
    }
};
     
