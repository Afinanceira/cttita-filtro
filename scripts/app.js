// Lista de caminhos com busca automática (tenta raiz, ativos/texturas e assets/textures/)
const badgeFiles = [
    'badge_atleta.png',
    'badge_sobrevivi.png',
    'badge_podio.png',
    'badge_modo_tita.png'
];

let currentBadgeIndex = 0;
const video = document.getElementById('webcam');
const badgeImg = document.getElementById('badgeImg');
const logoImg = document.getElementById('logoImg');

// Função de busca de ficheiro com fallback inteligente de pastas do GitHub
function setSmartSrc(imgElement, filename) {
    const paths = [
        filename,
        'ativos/texturas/' + filename,
        'ativos/ texturas/' + filename,
        'assets/textures/' + filename
    ];
    
    let pathIndex = 0;
    function tryNext() {
        if (pathIndex < paths.length) {
            imgElement.src = paths[pathIndex];
            pathIndex++;
        }
    }
    
    imgElement.onerror = tryNext;
    tryNext();
}

// Inicializar câmara
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1920 } },
            audio: false
        });
        video.srcObject = stream;
        await video.play();
    } catch (err) {
        console.error("Erro ao ativar a câmara:", err);
    }
}

// Carregar imagens iniciais
setSmartSrc(logoImg, 'ct_tita_logo.png');
setSmartSrc(badgeImg, badgeFiles[currentBadgeIndex]);

// Alternar entre as 4 frases
function nextBadge() {
    currentBadgeIndex = (currentBadgeIndex + 1) % badgeFiles.length;
    badgeImg.style.opacity = '0';
    
    setTimeout(() => {
        setSmartSrc(badgeImg, badgeFiles[currentBadgeIndex]);
        badgeImg.style.opacity = '1';
    }, 150);
}

document.getElementById('captureArea').addEventListener('click', (e) => {
    if(e.target.tagName !== 'BUTTON') {
        nextBadge();
    }
});

// CAPTURA DA FOTO
function takePhoto() {
    const canvas = document.getElementById('photoCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 1080;
    canvas.height = 1920;

    // 1. Desenha o vídeo da câmara
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 2. Fumaça Lateral Vermelha e Azul
    const gradLeft = ctx.createRadialGradient(0, 960, 50, 0, 960, 650);
    gradLeft.addColorStop(0, 'rgba(220, 38, 38, 0.55)');
    gradLeft.addColorStop(1, 'transparent');
    ctx.fillStyle = gradLeft;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradRight = ctx.createRadialGradient(1080, 960, 50, 1080, 960, 650);
    gradRight.addColorStop(0, 'rgba(37, 99, 235, 0.55)');
    gradRight.addColorStop(1, 'transparent');
    ctx.fillStyle = gradRight;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Desenha o Badge
    if (badgeImg.complete && badgeImg.naturalWidth !== 0) {
        const badgeWidth = 860;
        const badgeHeight = (badgeImg.naturalHeight / badgeImg.naturalWidth) * badgeWidth;
        const badgeY = canvas.height - 520;
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 20;
        ctx.drawImage(badgeImg, (canvas.width - badgeWidth) / 2, badgeY, badgeWidth, badgeHeight);
    }

    // 4. Desenha a Logo do CT Titã Grande e Destacada no Rodapé
    if (logoImg.complete && logoImg.naturalWidth !== 0) {
        const logoWidth = 780;
        const logoHeight = (logoImg.naturalHeight / logoImg.naturalWidth) * logoWidth;
        const logoY = canvas.height - logoHeight - 80;

        ctx.shadowColor = 'rgba(220, 38, 38, 0.8)';
        ctx.shadowBlur = 25;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 6;
        ctx.drawImage(logoImg, (canvas.width - logoWidth) / 2, logoY, logoWidth, logoHeight);
    }

    ctx.shadowColor = 'transparent';

    // Descarrega o ficheiro final PNG
    const link = document.createElement('a');
    link.download = `ct-tita-wod-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

window.addEventListener('load', initCamera);
