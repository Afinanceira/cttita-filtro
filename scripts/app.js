const badges = [
    'assets/textures/badge_atleta.png',
    'assets/textures/badge_sobrevivi.png',
    'assets/textures/badge_podio.png',
    'assets/textures/badge_modo_tita.png'
];

const badgesFallback = [
    'ativos/texturas/badge_atleta.png',
    'ativos/texturas/badge_sobrevivi.png',
    'ativos/texturas/badge_podio.png',
    'ativos/texturas/badge_modo_tita.png'
];

let currentBadgeIndex = 0;
let useFallback = false;
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;

const video = document.getElementById('webcam');

async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1920 } },
            audio: false
        });
        video.srcObject = stream;
    } catch (err) {
        alert("Por favor, permita a câmera no navegador para aceder ao filtro!");
        console.error("Erro câmera:", err);
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
    }, 120);
}

document.getElementById('badgeImg').addEventListener('error', function() {
    useFallback = true;
    this.src = badgesFallback[currentBadgeIndex];
});

document.getElementById('captureArea').addEventListener('click', (e) => {
    if(e.target.tagName !== 'BUTTON') {
        nextBadge();
    }
});

// FOTO ESTÁTICA COM SOMBRA 3D E LOGO NO RODAPÉ
function takePhoto() {
    const canvas = document.getElementById('photoCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 1080;
    canvas.height = 1920;

    // 1. Desenha a imagem da câmera
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 2. Desenha a fumaça azul e vermelha via código no Canvas
    const gradLeft = ctx.createRadialGradient(0, 960, 50, 0, 960, 600);
    gradLeft.addColorStop(0, 'rgba(220, 38, 38, 0.45)');
    gradLeft.addColorStop(1, 'transparent');
    ctx.fillStyle = gradLeft;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradRight = ctx.createRadialGradient(1080, 960, 50, 1080, 960, 600);
    gradRight.addColorStop(0, 'rgba(37, 99, 235, 0.45)');
    gradRight.addColorStop(1, 'transparent');
    ctx.fillStyle = gradRight;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const logo = new Image();
    const badge = new Image();

    const basePath = useFallback ? 'ativos/texturas/' : 'assets/textures/';
    logo.src = basePath + 'ct_tita_logo.png';
    badge.src = useFallback ? badgesFallback[currentBadgeIndex] : badges[currentBadgeIndex];

    let loadedCount = 0;
    function renderFinal() {
        loadedCount++;
        if (loadedCount === 2) {
            // Desenha Badge
            const badgeWidth = 840;
            const badgeHeight = (badge.height / badge.width) * badgeWidth;
            const badgeY = canvas.height - 480;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 15;
            ctx.drawImage(badge, (canvas.width - badgeWidth) / 2, badgeY, badgeWidth, badgeHeight);

            // Desenha Logo 3D Grande no Rodapé
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
    badge.onload = renderFinal;
}

// GRAVAÇÃO DE BOOMERANG / VÍDEO CURTO (3 SEGUNDOS)
function toggleRecord() {
    const recBtn = document.getElementById('recBtn');
    
    if (isRecording) return;
    
    recordedChunks = [];
    const stream = video.srcObject;
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ct-tita-boomerang-${Date.now()}.webm`;
        a.click();
        recBtn.innerText = '🎥 Boomerang';
        recBtn.style.background = '#dc2626';
        isRecording = false;
    };

    mediaRecorder.start();
    isRecording = true;
    recBtn.innerText = '🔴 Gravando...';
    recBtn.style.background = '#16a34a';

    // Grava 3.5 segundos automaticamente (formato boomerang)
    setTimeout(() => {
        if (isRecording) mediaRecorder.stop();
    }, 3500);
}

window.addEventListener('load', initCamera);
