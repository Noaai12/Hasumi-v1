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
 { id: 13, name: "Ancient Relic", emoji: "🗿", value: 5000, rarity: "mythical" },
 { id: 14, name: "Celestial Orb", emoji: "🔆", value: 8000, rarity: "mythical" }
];

const shopItems = [
 { id: 101, name: "Basic Pickaxe", price: 50, effect: "+5% Rare chance" },
 { id: 102, name: "Lucky Charm", price: 200, effect: "+2% Legendary chance (1 jam)" },
 { id: 103, name: "Mystery Box", price: 100, effect: "Random 3-5 materials" },
 { id: 104, name: "Ultra Drill", price: 300, effect: "+15% Epic chance" },
 { id: 105, name: "Reinforced Helmet", price: 250, effect: "+10 bonus coins per mining" }
];

const rarityWeights = {
 common: 80,
 rare: 15,
 epic: 4,
 legendary: 0.8,
 mythical: 0.2
};

// Multiplier untuk menentukan harga jual berdasarkan rarity
const sellMultiplier = {
 common: 0.5,
 rare: 0.5,
 epic: 0.5,
 legendary: 0.5,
 mythical: 0.1
};

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

function getRandomRarity(weights) {
 let total = Object.values(weights).reduce((a, b) => a + b, 0);
 let rand = Math.random() * total;
 for (let rarity in weights) {
 if (rand < weights[rarity]) return rarity;
 rand -= weights[rarity];
 }
 return "common";
}

function getRandomMaterial() {
 const rarity = getRandomRarity(rarityWeights);
 const available = materials.filter(m => m.rarity === rarity);
 return available[Math.floor(Math.random() * available.length)];
}

module.exports = {
 name: "mine",
 aliases: ["mining"],
 description: "Menambang material, jual, beli, daily reward, dan cek status.",
 usage: "{prefix}mine [jumlah] | sell [id] [jumlah] | shop | buy [id] [jumlah] | status | daily",
 cooldown: 5,
 async execute(api, event, args) {
 const userId = event.senderID;
 const userData = loadUserData();
 if (!userData[userId]) {
 userData[userId] = {
 inventory: {},
 balance: 1000,
 luckBoosts: 0,
 luckExpiration: 0,
 lastDaily: 0
 };
 }
 const user = userData[userId];
 user.luckBoosts = user.luckBoosts || 0;
 let message = "";
 if (args.length === 0) {
 message = "=== Mine Command Help ===\n";
 message += "1. Mining: !mine [jumlah]\n contoh: !mine 3\n";
 message += "2. Sell: !mine sell [id] [jumlah]\n contoh: !mine sell 1 2\n";
 message += "3. Shop: !mine shop\n";
 message += "4. Buy: !mine buy [id] [jumlah]\n contoh: !mine buy 101 1\n";
 message += "5. Status: !mine status\n";
 message += "6. Daily: !mine daily\n";
 api.sendMessage(message, event.threadID);
 saveUserData(userData);
 return;
 }
 let subcommand = args[0].toLowerCase();
 if (subcommand === "sell") {
 const sellId = parseInt(args[1]);
 const sellQty = parseInt(args[2]) || 1;
 if (!sellId || !user.inventory[sellId] || user.inventory[sellId] < sellQty) {
 message = "❌ Barang tidak cukup atau tidak ditemukan!";
 } else {
 const sellItem = materials.find(m => m.id == sellId);
 user.inventory[sellId] -= sellQty;
 if (user.inventory[sellId] <= 0) delete user.inventory[sellId];
 const multiplier = sellMultiplier[sellItem.rarity] || 0.5;
 const totalPrice = Math.floor(sellItem.value * sellQty * multiplier);
 user.balance += totalPrice;
 message = `✅ Terjual ${sellQty}× ${sellItem.name}\n Id item: ${sellItem.id}\n Rarity: ${sellItem.rarity}\n Total: ${totalPrice} coin.`;
 }
 } else if (subcommand === "shop") {
 let shopText = "🛒 Mining Shop:\n\n";
 let count = 1;
 shopItems.forEach(item => {
 shopText += `${count}. Nama item: ${item.name}\n Id item: ${item.id}\n Price: ${item.price} coin\n Effect: ${item.effect}\n\n`;
 count++;
 });
 message = shopText;
 } else if (subcommand === "buy") {
 const buyId = parseInt(args[1]);
 const buyQty = parseInt(args[2]) || 1;
 if (!buyId) {
 message = "❌ Format: buy [id] [jumlah]";
 } else {
 const shopItem = shopItems.find(i => i.id === buyId);
 if (!shopItem) {
 message = "❌ Item tidak ditemukan!";
 } else {
 const totalCost = shopItem.price * buyQty;
 if (user.balance < totalCost) {
 message = "❌ Uang tidak cukup!";
 } else {
 user.balance -= totalCost;
 message = `✅ Berhasil membeli ${buyQty}× ${shopItem.name}\n Id item: ${shopItem.id}\n Total: ${totalCost} coin.`;
 }
 }
 }
 } else if (subcommand === "status") {
 let now = Date.now();
 let remainingTime = user.luckExpiration > now ? Math.round((user.luckExpiration - now) / 60000) : 0;
 let statusMsg = "=== Mine Status ===\n";
 statusMsg += `Balance: ${user.balance} coin\n`;
 statusMsg += `Buff: ${user.luckBoosts}%\n`;
 statusMsg += `Sisa waktu buff: ${remainingTime} menit\n\n`;
 let breakdown = {};
 for (let id in user.inventory) {
 let item = materials.find(m => m.id == id);
 if (item) breakdown[item.rarity] = (breakdown[item.rarity] || 0) + user.inventory[id];
 }
 statusMsg += "Inventory:\n";
 ["common", "rare", "epic", "legendary", "mythical"].forEach(rarity => {
 statusMsg += `${rarity.charAt(0).toUpperCase() + rarity.slice(1)}: ${breakdown[rarity] || 0}\n`;
 });
 message = statusMsg;
 } else if (subcommand === "daily") {
 let now = Date.now();
 const oneDay = 24 * 60 * 60 * 1000;
 if (now - user.lastDaily < oneDay) {
 let remaining = Math.round((oneDay - (now - user.lastDaily)) / 60000);
 message = `⏳ Anda sudah mengambil daily reward. Coba lagi dalam ${remaining} menit.`;
 } else {
 user.lastDaily = now;
 if (Math.random() < 0.5) {
 const coinReward = Math.floor(Math.random() * 91) + 10; // antara 10-100
 user.balance += coinReward;
 message = `🎉 Daily Reward: Anda mendapatkan ${coinReward} coin.`;
 } else {
 const commonItems = materials.filter(m => m.rarity === "common");
 const rewardItem = commonItems[Math.floor(Math.random() * commonItems.length)];
 user.inventory[rewardItem.id] = (user.inventory[rewardItem.id] || 0) + 1;
 message = `🎉 Daily Reward: Anda mendapatkan item ${rewardItem.name} (Id: ${rewardItem.id}, Rarity: ${rewardItem.rarity}).`;
 }
 }
 } else if (!isNaN(parseInt(subcommand))) {
 const mineQty = Math.min(parseInt(subcommand) || 1, 10);
 let minedGroup = {};
 for (let i = 0; i < mineQty; i++) {
 const material = getRandomMaterial();
 minedGroup[material.id] = minedGroup[material.id] ? minedGroup[material.id] + 1 : 1;
 user.inventory[material.id] = (user.inventory[material.id] || 0) + 1;
 }
 let mineText = "⛏️ Hasil Mining:\n\n";
 let count = 1;
 for (let id in minedGroup) {
 const item = materials.find(m => m.id == id);
 mineText += `${count}. Nama item: ${item.name} : ${minedGroup[id]}×\n Id item: ${item.id}\n Rarity: ${item.rarity}\n\n`;
 count++;
 }
 message = mineText;
 } else {
 message = "Perintah tidak dikenal. Gunakan !mine saja untuk melihat daftar perintah.";
 }
 userData[userId] = user;
 saveUserData(userData);
 api.sendMessage(message, event.threadID);
 }
};