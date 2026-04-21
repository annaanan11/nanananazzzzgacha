// 角色資料庫
const characterPool = [
    { id: 1, name: "星之勇者", rarity: "SSR", weight: 5, img: "https://placehold.jp/30/ffd700/ffffff/200x280.png?text=SSR" },
    { id: 2, name: "影之刺客", rarity: "SR", weight: 25, img: "https://placehold.jp/30/9b59b6/ffffff/200x280.png?text=SR" },
    { id: 3, name: "森林衛兵", rarity: "R", weight: 70, img: "https://placehold.jp/30/2ecc71/ffffff/200x280.png?text=R" }
];

let collection = new Set();
let currentPackCards = []; // 存放目前這包抽到的 5 張卡
let currentCardIndex = 0;  // 記錄目前正在看第幾張卡

// 初始化圖鑑
function initCollection() {
    const grid = document.getElementById('collection-grid');
    document.getElementById('total-count').innerText = characterPool.length;
    grid.innerHTML = '';
    
    characterPool.forEach(char => {
        const item = document.createElement('div');
        item.id = `char-${char.id}`;
        item.className = 'col-item';
        item.innerHTML = `
            <img src="${char.img}" style="width:100%; border-radius: 5px;">
            <p style="margin-top: 5px;">${char.name}</p>
        `;
        grid.appendChild(item);
    });
}

// 抽取單一張卡的邏輯
function drawSingleCard() {
    const totalWeight = characterPool.reduce((s, c) => s + c.weight, 0);
    let random = Math.random() * totalWeight;
    for (let char of characterPool) {
        if (random < char.weight) return char;
        random -= char.weight;
    }
    return characterPool[0]; // 防呆機制
}

// 撕開卡包
function openPack() {
    const pack = document.getElementById('card-pack');
    if (pack.classList.contains('open')) return;

    // 觸發撕開動畫
    pack.classList.add('open');

    // 產生 5 張卡片
    currentPackCards = [];
    for (let i = 0; i < 5; i++) {
        currentPackCards.push(drawSingleCard());
    }
    
    currentCardIndex = 0; // 重置觀看進度到第 1 張

    // 等待 0.7 秒動畫播完後，顯示第一張卡
    setTimeout(() => {
        pack.classList.add('hidden');
        document.getElementById('result-display').classList.remove('hidden');
        updateCardDisplay(); // 更新畫面
    }, 700);
}

// 更新畫面上顯示的卡片內容
function updateCardDisplay() {
    const char = currentPackCards[currentCardIndex];
    
    // 更新卡片資訊
    document.getElementById('card-rarity').innerText = char.rarity;
    document.getElementById('card-name').innerText = char.name;
    document.getElementById('card-image').src = char.img;
    document.getElementById('current-page').innerText = currentCardIndex + 1;

    // 更新圖鑑
    collection.add(char.id);
    document.getElementById(`char-${char.id}`).classList.add('unlocked');
    document.getElementById('collected-count').innerText = collection.size;

    // 控制左右按鈕的啟用與禁用
    document.getElementById('btn-prev').disabled = (currentCardIndex === 0);
    document.getElementById('btn-next').disabled = (currentCardIndex === 4);
}

// 看上一張
function prevCard() {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        updateCardDisplay();
    }
}

// 看下一張
function nextCard() {
    if (currentCardIndex < 4) {
        currentCardIndex++;
        updateCardDisplay();
    }
}

// 重置卡包，準備下一輪
function resetPack() {
    document.getElementById('result-display').classList.add('hidden');
    const pack = document.getElementById('card-pack');
    pack.classList.remove('hidden', 'open');
}

// 網頁載入後執行
window.onload = initCollection;
