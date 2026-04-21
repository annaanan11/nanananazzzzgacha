// 1. 設定你的 OC 角色資料
const characterPool = [
    { id: 1, name: "星之勇者", rarity: "SSR", weight: 5, img: "https://placehold.jp/30/ffd700/ffffff/200x280.png?text=SSR" },
    { id: 2, name: "影之刺客", rarity: "SR", weight: 25, img: "https://placehold.jp/30/9b59b6/ffffff/200x280.png?text=SR" },
    { id: 3, name: "森林衛兵", rarity: "R", weight: 70, img: "https://placehold.jp/30/2ecc71/ffffff/200x280.png?text=R" }
];

let collection = new Set();

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
            <img src="${char.img}" style="width:100%">
            <p>${char.name}</p>
        `;
        grid.appendChild(item);
    });
}

// 執行抽卡
function openPack() {
    const pack = document.getElementById('card-pack');
    if (pack.classList.contains('open')) return;

    pack.classList.add('open');

    // 隨機抽選
    const totalWeight = characterPool.reduce((s, c) => s + c.weight, 0);
    let random = Math.random() * totalWeight;
    let selected = characterPool[0];

    for (let char of characterPool) {
        if (random < char.weight) {
            selected = char;
            break;
        }
        random -= char.weight;
    }

    // 0.6秒後顯示結果 (等待動畫)
    setTimeout(() => {
        pack.classList.add('hidden');
        showResult(selected);
    }, 600);
}

function showResult(char) {
    const res = document.getElementById('result-display');
    res.classList.remove('hidden');
    document.getElementById('card-rarity').innerText = char.rarity;
    document.getElementById('card-name').innerText = char.name;
    document.getElementById('card-image').src = char.img;

    // 解鎖圖鑑
    collection.add(char.id);
    document.getElementById(`char-${char.id}`).classList.add('unlocked');
    document.getElementById('collected-count').innerText = collection.size;
}

function resetPack() {
    document.getElementById('result-display').classList.add('hidden');
    const pack = document.getElementById('card-pack');
    pack.classList.remove('hidden', 'open');
}

// 網頁載入後執行
window.onload = initCollection;
