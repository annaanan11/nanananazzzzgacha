// 1. 建立核心角色
const characterPool = [
    { id: 1, name: "星之勇者", rarity: "SSR", weight: 5, img: "https://placehold.jp/30/ffd700/ffffff/200x280.png?text=SSR" },
    { id: 2, name: "影之刺客", rarity: "SR", weight: 25, img: "https://placehold.jp/30/9b59b6/ffffff/200x280.png?text=SR" },
    { id: 3, name: "森林衛兵", rarity: "R", weight: 70, img: "https://placehold.jp/30/2ecc71/ffffff/200x280.png?text=R" }
];

// 2. 自動補足到 50 個角色 (N卡雜魚)
for (let i = 4; i <= 50; i++) {
    characterPool.push({
        id: i,
        name: `一般角色 ${i}`,
        rarity: "N",
        weight: 100, // 雜魚的機率很高
        img: `https://placehold.jp/20/bdc3c7/ffffff/200x280.png?text=No.${i}`
    });
}

let collection = new Set();
let currentPackCards = []; 
let currentCardIndex = 0;  

// --- 存檔系統 ---

// 讀取存檔 (網頁載入時執行)
function loadGame() {
    const savedData = localStorage.getItem('oc_gacha_save');
    if (savedData) {
        // 將文字存檔轉換回 Set 陣列
        const savedArray = JSON.parse(savedData);
        collection = new Set(savedArray);
    }
}

// 寫入存檔 (每次抽到新卡時執行)
function saveGame() {
    // Set 必須轉成普通陣列才能存成字串
    const arrayToSave = Array.from(collection);
    localStorage.setItem('oc_gacha_save', JSON.stringify(arrayToSave));
}

// 清除存檔
function clearSave() {
    if (confirm("確定要刪除所有圖鑑紀錄嗎？此動作無法復原喔！")) {
        localStorage.removeItem('oc_gacha_save');
        collection.clear();
        initCollection(); // 重新整理圖鑑畫面
        alert("存檔已刪除！");
    }
}

// 下載存檔 (備份成 JSON 檔案)
function downloadSave() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(Array.from(collection)));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "my_oc_gacha_save.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// --- 介面與抽卡邏輯 ---

// 初始化圖鑑
function initCollection() {
    const grid = document.getElementById('collection-grid');
    document.getElementById('total-count').innerText = characterPool.length;
    document.getElementById('collected-count').innerText = collection.size;
    grid.innerHTML = '';
    
    characterPool.forEach(char => {
        const item = document.createElement('div');
        item.id = `char-${char.id}`;
        // 如果這個 ID 有在存檔裡，就加上 unlocked 樣式
        item.className = `col-item ${collection.has(char.id) ? 'unlocked' : ''}`;
        item.innerHTML = `
            <img src="${char.img}" style="width:100%; border-radius: 3px;">
            <p style="margin-top: 3px; font-weight:bold;">${char.id}</p>
        `;
        grid.appendChild(item);
    });
}

function drawSingleCard() {
    const totalWeight = characterPool.reduce((s, c) => s + c.weight, 0);
    let random = Math.random() * totalWeight;
    for (let char of characterPool) {
        if (random < char.weight) return char;
        random -= char.weight;
    }
    return characterPool[0];
}

function openPack() {
    const pack = document.getElementById('card-pack');
    if (pack.classList.contains('open')) return;
    pack.classList.add('open');

    currentPackCards = [];
    for (let i = 0; i < 5; i++) {
        currentPackCards.push(drawSingleCard());
    }
    
    currentCardIndex = 0;

    setTimeout(() => {
        pack.classList.add('hidden');
        document.getElementById('result-display').classList.remove('hidden');
        updateCardDisplay();
    }, 700);
}

function updateCardDisplay() {
    const char = currentPackCards[currentCardIndex];
    
    document.getElementById('card-rarity').innerText = char.rarity;
    document.getElementById('card-name').innerText = char.name;
    document.getElementById('card-image').src = char.img;
    document.getElementById('current-page').innerText = currentCardIndex + 1;

    // 解鎖圖鑑與存檔
    collection.add(char.id);
    document.getElementById(`char-${char.id}`).classList.add('unlocked');
    document.getElementById('collected-count').innerText = collection.size;
    
    // **每次有進度就自動存檔**
    saveGame();

    document.getElementById('btn-prev').disabled = (currentCardIndex === 0);
    document.getElementById('btn-next').disabled = (currentCardIndex === 4);
}

function prevCard() { if (currentCardIndex > 0) { currentCardIndex--; updateCardDisplay(); } }
function nextCard() { if (currentCardIndex < 4) { currentCardIndex++; updateCardDisplay(); } }

function resetPack() {
    document.getElementById('result-display').classList.add('hidden');
    const pack = document.getElementById('card-pack');
    pack.classList.remove('hidden', 'open');
}

// 網頁載入後，先讀檔，再初始化介面
window.onload = () => {
    loadGame();
    initCollection();
};
