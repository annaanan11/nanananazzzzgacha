// 角色資料庫與存檔機制不變
const characterPool = [
    { id: 1, name: "星之勇者", rarity: "SSR", weight: 5, img: "https://placehold.jp/30/ffd700/ffffff/200x280.png?text=SSR" },
    { id: 2, name: "影之刺客", rarity: "SR", weight: 25, img: "https://placehold.jp/30/9b59b6/ffffff/200x280.png?text=SR" },
    { id: 3, name: "森林衛兵", rarity: "R", weight: 70, img: "https://placehold.jp/30/2ecc71/ffffff/200x280.png?text=R" }
];

for (let i = 4; i <= 50; i++) {
    characterPool.push({ id: i, name: `一般角色 ${i}`, rarity: "N", weight: 100, img: `https://placehold.jp/20/bdc3c7/ffffff/200x280.png?text=No.${i}` });
}

let collection = new Set();
let currentPackCards = []; 
let currentCardIndex = 0;  

function loadGame() {
    const savedData = localStorage.getItem('oc_gacha_save');
    if (savedData) collection = new Set(JSON.parse(savedData));
}

function saveGame() {
    localStorage.setItem('oc_gacha_save', JSON.stringify(Array.from(collection)));
}

function clearSave() {
    if (confirm("確定要刪除所有圖鑑紀錄嗎？此動作無法復原喔！")) {
        localStorage.removeItem('oc_gacha_save');
        collection.clear();
        initCollection(); 
        alert("存檔已刪除！");
    }
}

function downloadSave() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(Array.from(collection)));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "my_oc_gacha_save.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function initCollection() {
    const grid = document.getElementById('collection-grid');
    document.getElementById('total-count').innerText = characterPool.length;
    document.getElementById('collected-count').innerText = collection.size;
    grid.innerHTML = '';
    
    characterPool.forEach(char => {
        const item = document.createElement('div');
        item.id = `char-${char.id}`;
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

    // 建立 5 張卡的 HTML
    const deck = document.getElementById('deck-container');
    deck.innerHTML = ''; // 清空上一包的卡
    currentPackCards.forEach((char) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'deck-card';
        cardEl.innerHTML = `
            <div class="rarity-badge">${char.rarity}</div>
            <img src="${char.img}" alt="OC">
            <h3>${char.name}</h3>
        `;
        deck.appendChild(cardEl);
    });

    setTimeout(() => {
        pack.classList.add('hidden');
        document.getElementById('result-display').classList.remove('hidden');
        updateCardDisplay();
    }, 700);
}

// 核心疊卡邏輯計算
function updateCardDisplay() {
    const cards = document.querySelectorAll('.deck-card');
    
    cards.forEach((card, index) => {
        // 計算這張卡與「現在正在看的卡」的距離差
        let offset = index - currentCardIndex;
        
        if (offset === 0) {
            // 目前正在看的這張卡：顯示在最前面，大小正常
            card.style.transform = `translateX(0px) scale(1)`;
            card.style.zIndex = 10;
            card.style.opacity = 1;
        } else if (offset > 0) {
            // 排在後面的卡：往右推一點，並且稍微縮小
            // offset * 30px 代表每張卡往右露出一點邊緣
            card.style.transform = `translateX(${offset * 30}px) scale(${1 - offset * 0.05})`;
            card.style.zIndex = 10 - offset; // 越後面的卡 z-index 越小，才會被蓋住
            card.style.opacity = 1;
        } else {
            // 已經看過(被滑掉)的卡：往左邊飛出去並變透明
            card.style.transform = `translateX(-100px) scale(0.8)`;
            card.style.zIndex = 0;
            card.style.opacity = 0;
        }
    });

    // 處理當前卡片的圖鑑解鎖
    const currentChar = currentPackCards[currentCardIndex];
    collection.add(currentChar.id);
    document.getElementById(`char-${currentChar.id}`).classList.add('unlocked');
    document.getElementById('collected-count').innerText = collection.size;
    saveGame();

    // 控制左右按鈕啟用狀態
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

window.onload = () => {
    loadGame();
    initCollection();
};
