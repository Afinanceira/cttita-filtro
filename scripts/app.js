// Lista dos 4 Badges configurados na pasta assets/textures/
const badges = [
    'assets/textures/badge_atleta.png',
    'assets/textures/badge_sobrevivi.png',
    'assets/textures/badge_podio.png',
    'assets/textures/badge_modo_tita.png'
];

let currentBadgeIndex = 0;

// Inicializa a Câmara do Telemóvel/PC
const video = document.getElementById('webcam');

async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1920 } },
            audio: false
        });
        video.srcObject = stream;
    } catch (err) {
        alert("Por favor, permita o acesso à câmara para usar o filtro do CT Titã!");
        console.error("Erro na câmara:", err);
    }
}

// Função para alternar os Badges ao clicar no botão ou tocar no ecrã
function nextBadge() {
    currentBadgeIndex = (currentBadgeIndex + 1) % badges.length;
    const badgeImg = document.getElementById('badgeImg');
    badgeImg.style.opacity = '0';
    setTimeout(() => {
        badgeImg.src = badges[currentBadgeIndex];
        badgeImg.style.opacity = '1';
    }, 150);
}

// Permite tocar na área da câmara para trocar o badge também!
document.getElementById('captureArea').addEventListener('click', (e) => {
    if(e.target.tagName !== 'BUTTON') {
        nextBadge();
    }
});

// Captura a foto juntando a câmara + logo + fumaça + badge num único ficheiro PNG
function takePhoto() {
    const canvas = document.getElementById('photoCanvas');
    const ctx = canvas.getContext('2d');

    // Define a resolução de Stories (1080x1920)
    canvas.width = 1080;
    canvas.height = 1920;

    // 1. Desenha a foto da câmara
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Carrega e desenha os overlays na imagem final
    const smoke = new Image();
    const logo = new Image();
    const badge = new Image();

    smoke.src = 'assets/textures/smoke_frame.png';
    logo.src = 'assets/textures/ct_tita_logo.png';
    badge.src = badges[currentBadgeIndex];

    let loadedCount = 0;
    const totalImages = 3;

    function renderFinalImage() {
        loadedCount++;
        if (loadedCount === totalImages) {
            // Desenha fumaça, logo e badge no canvas final
            ctx.drawImage(smoke, 0, 0, canvas.width, canvas.height);
            
            // Desenha logo no topo
            const logoWidth = 500;
            const logoHeight = (logo.height / logo.width) * logoWidth;
            ctx.drawImage(logo, (canvas.width - logoWidth) / 2, 80, logoWidth, logoHeight);

            // Desenha badge no rodapé
            const badgeWidth = 800;
            const badgeHeight = (badge.height / badge.width) * badgeWidth;
            ctx.drawImage(badge, (canvas.width - badgeWidth) / 2, canvas.height - 250, badgeWidth, badgeHeight);

            // Faz o download automático da foto para o telemóvel do atleta
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

// Inicia a câmara assim que a página carrega
window.addEventListener('load', initCamera);
