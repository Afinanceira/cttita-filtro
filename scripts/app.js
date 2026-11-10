const badges = [
    'assets/textures/badge_atleta.png',
    'assets/textures/badge_sobrevivi.png',
    'assets/textures/badge_podio.png',
    'assets/textures/badge_modo_tita.png'
];

// Fallback de caminhos caso o GitHub tenha mantido a pasta traduzida como "ativos/texturas"
const badgesFallback = [
    'ativos/texturas/badge_atleta.png',
    'ativos/texturas/badge_sobrevivi.png',
    'ativos/texturas/badge_podio.png',
    'ativos/texturas/badge_modo_tita.png'
];

let currentBadgeIndex = 0;
let useFallback = false;
const video = document.getElementById('webcam');

async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1920 } },
            audio: false
        });
        video.srcObject = stream;
    } catch (err) {
        alert("Por favor, permita o acesso à câmera para usar o filtro do CT Titã!");
        console.error("Erro na câmera:", err);
    }
}

function nextBadge() {
    currentBadgeIndex = (currentBadgeIndex + 1) % badges.length;
    const badgeImg = document.getElementById('badgeImg');
    badgeImg.style.opacity = '0';
    
    setTimeout(() => {
        const list = useFallback ? badgesFallback : badges;
        badgeImg.src = list[currentBadgeIndex];
        badgeImg.style.opacity = '1';
    }, 150);
}

// Verifica erro no carregamento inicial para ativar o fallback da pasta
document.getElementById('badgeImg').addEventListener('error', function() {
    useFallback = true;
    this.src = badgesFallback[currentBadgeIndex];
});

document.getElementById('captureArea').addEventListener('click', (e) => {
    if(e.target.tagName !== 'BUTTON') {
        nextBadge();
    }
});

function takePhoto() {
    const canvas = document.getElementById('photoCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 1080;
    canvas.height = 1920;

    // 1. Desenha a foto da câmera
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const smoke = new Image();
    const logo = new Image();
    const badge = new Image();

    const basePath = useFallback ? 'ativos/texturas/' : 'assets/textures/';

    smoke.src = basePath + 'smoke_frame.png';
    logo.src = basePath + 'ct_tita_logo.png';
    badge.src = useFallback ? badgesFallback[currentBadgeIndex] : badges[currentBadgeIndex];

    let loadedCount = 0;

    function renderFinalImage() {
        loadedCount++;
        if (loadedCount === 3) {
            // 2. Desenha a Fumaça cobrindo a tela inteira
            ctx.globalAlpha = 0.85;
            ctx.drawImage(smoke, 0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1.0;
            
            // 3. Desenha o Badge/Frase centralizado acima da logo
            const badgeWidth = 850;
            const badgeHeight = (badge.height / badge.width) * badgeWidth;
            const badgeY = canvas.height - 480;
            
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 20;
            ctx.drawImage(badge, (canvas.width - badgeWidth) / 2, badgeY, badgeWidth, badgeHeight);

            // 4. Desenha a Logo do CT Titã MAIOR, em 3D (com sombras em camadas) no FINAL DA TELA
            const logoWidth = 750;
            const logoHeight = (logo.height / logo.width) * logoWidth;
            const logoY = canvas.height - logoHeight - 60;

            // Sombra vermelha e preta para dar o efeito 3D exaltado
            ctx.shadowColor = 'rgba(220, 38, 38, 0.7)';
            ctx.shadowBlur = 30;
            ctx.shadowOffsetY = 10;
            ctx.drawImage(logo, (canvas.width - logoWidth) / 2, logoY, logoWidth, logoHeight);

            // Reseta a sombra
            ctx.shadowColor = 'transparent';

            // 5. Baixa a foto pronta em PNG
            const link = document.createElement('a');
            link.download = `ct-tita-wod-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    }

    smoke.onload = renderFinalImage;
    logo.onload = renderFinalImage;
    badge.onload = renderFinalImage;
}

window.addEventListener('load', initCamera);
