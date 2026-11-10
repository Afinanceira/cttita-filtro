// Lista priorizando a pasta que está no repositório do GitHub
const badges = [
    'ativos/texturas/badge_atleta.png',
    'ativos/texturas/badge_sobrevivi.png',
    'ativos/texturas/badge_podio.png',
    'ativos/texturas/badge_modo_tita.png'
];

const badgesFallback = [
    'assets/textures/badge_atleta.png',
    'assets/textures/badge_sobrevivi.png',
    'assets/textures/badge_podio.png',
    'assets/textures/badge_modo_tita.png'
];

const badgeTexts = [
    '[ ATLETA CONFIRMADO ]',
    '[ SOBREVIVI AO WOD ]',
    '[ RUMO AO PÓDIO ]',
    '[ MODO TITÃ: ACTIVATED ]'
];

let currentBadgeIndex = 0;
const video = document.getElementById('webcam');

async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1920 } },
            audio: false
        });
        video.srcObject = stream;
    } catch (err) {
        alert("Por favor, permita a câmera no navegador para usar o filtro!");
        console.error("Erro câmera:", err);
    }
}

function nextBadge() {
    currentBadgeIndex = (currentBadgeIndex + 1) % badges.length;
    const badgeImg = document.getElementById('badgeImg');
    const badgeFallback = document.getElementById('badgeFallback');
    
    badgeImg.style.opacity = '0';
    
    setTimeout(() => {
        badgeImg.src = badges[currentBadgeIndex];
        badgeFallback.innerText = badgeTexts[currentBadgeIndex];
        badgeImg.style.opacity = '1';
    }, 120);
}

// Tratamento caso a imagem PNG falhe ao carregar
document.getElementById('badgeImg').addEventListener('error', function() {
    // Tenta primeiro a pasta fallback alternativa assets/textures/
    if (!this.dataset.retried) {
        this.dataset.retried = 'true';
        this.src = badgesFallback[currentBadgeIndex];
    } else {
        // Se ambos falharem, exibe o banner de texto estilizado
        this.style.display = 'none';
        document.getElementById('badgeFallback').style.display = 'block';
    }
});

document.getElementById('badgeImg').addEventListener('load', function() {
    this.style.display = 'block';
    document.getElementById('badgeFallback').style.display = 'none';
});

document.getElementById('captureArea').addEventListener('click', (e) => {
    if(e.target.tagName !== 'BUTTON') {
        nextBadge();
    }
});

// CAPTURA DA FOTO EM PNG
function takePhoto() {
    const canvas = document.getElementById('photoCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 1080;
    canvas.height = 1920;

    // 1. Desenha a foto da câmera
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 2. Desenha a fumaça lateral no Canvas
    const gradLeft = ctx.createRadialGradient(0, 960, 50, 0, 960, 600);
    gradLeft.addColorStop(0, 'rgba(220, 38, 38, 0.5)');
    gradLeft.addColorStop(1, 'transparent');
    ctx.fillStyle = gradLeft;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradRight = ctx.createRadialGradient(1080, 960, 50, 1080, 960, 600);
    gradRight.addColorStop(0, 'rgba(37, 99, 235, 0.5)');
    gradRight.addColorStop(1, 'transparent');
    ctx.fillStyle = gradRight;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const logo = new Image();
    const badge = new Image();

    logo.src = 'ativos/texturas/ct_tita_logo.png';
    badge.src = badges[currentBadgeIndex];

    let loadedCount = 0;
    
    function renderFinal() {
        loadedCount++;
        if (loadedCount === 2) {
            // Desenha Frase / Badge
            const badgeWidth = 840;
            const badgeHeight = (badge.height / badge.width) * badgeWidth;
            const badgeY = canvas.height - 480;
            
            ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
            ctx.shadowBlur = 18;
            ctx.drawImage(badge, (canvas.width - badgeWidth) / 2, badgeY, badgeWidth, badgeHeight);

            // Desenha Logo CT Titã em 3D no Rodapé
            const logoWidth = 760;
            const logoHeight = (logo.height / logo.width) * logoWidth;
            const logoY = canvas.height - logoHeight - 70;

            ctx.shadowColor = 'rgba(220, 38, 38, 0.8)';
            ctx.shadowBlur = 25;
            ctx.shadowOffsetX = -4;
            ctx.shadowOffsetY = 8;
            ctx.drawImage(logo, (canvas.width - logoWidth) / 2, logoY, logoWidth, logoHeight);

            ctx.shadowColor = 'transparent';

            // Baixa foto PNG
            const link = document.createElement('a');
            link.download = `ct-tita-wod-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    }

    logo.onload = renderFinal;
    logo.onerror = () => { logo.src = 'assets/textures/ct_tita_logo.png'; };
    badge.onload = renderFinal;
    badge.onerror = () => { badge.src = badgesFallback[currentBadgeIndex]; };
}

window.addEventListener('load', initCamera);
