let eskaera = []; // Saskia
let totala = 0;
let egungoEguna = 'ostirala'; // Defektuzkoa kargatzeko

document.addEventListener('DOMContentLoaded', () => {
    kargatuMenuBotoiak();
    document.getElementById('emandako-dirua').addEventListener('input', kalkulatuBueltak);
});

// Botoien funtzioa (estiloak aldatu eta kargatu)
async function aldatuEguna(eguna) {
    egungoEguna = eguna;
    
    document.querySelectorAll('.egun-botoiak button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${eguna}`).classList.add('active');
    
    await kargatuMenuBotoiak();
}

async function kargatuMenuBotoiak() {
    try {
        // Kontrolatzaile berrira egiten dugu deia
        const response = await fetch(`/caja/api/menu?eguna=${egungoEguna}`);
        const produktuak = await response.json();
        
        const botoiSarea = document.getElementById('produktu-botoiak');
        botoiSarea.innerHTML = ''; 

        // GAKOA: Kalkulu dinamikoa zutabeen tamainarentzako.
        // 10 produktu baino gehiago badaude (Osteguna=11), 6 zutabe behar ditugu. Bestela, 5.
        const zutabeKopurua = produktuak.length > 10 ? 6 : 5;
        const txartelZabalera = `calc((100% - ${15 * (zutabeKopurua - 1)}px) / ${zutabeKopurua})`;

        produktuak.forEach(prod => {
            const div = document.createElement('div');
            div.className = 'produktu-card';
            div.style.width = txartelZabalera; // Inline CSS-a zabalera finkatzeko
            
            const stockClass = prod.stock <= 50 ? 'stock-badge stock-low' : 'stock-badge';
            
            div.innerHTML = `
                <div class="${stockClass}">${prod.stock}</div>
                <img src="/img/${prod.izena}.png" alt="${prod.izena}" class="produktu-irudia" onerror="this.src='/img/placeholder.png'">
                <div class="prod-info">
                    <h3>${prod.izena}</h3>
                    <span class="prezioa">${parseFloat(prod.precio).toFixed(2)} €</span>
                </div>
                <div class="card-actions">
                    <button class="btn-minus" onclick="kenduTiketatikBat(${prod.id})">-</button>
                    <button class="btn-plus" onclick="gehituTiketera(${prod.id}, '${prod.izena}', ${prod.precio})">+</button>
                </div>
            `;
            botoiSarea.appendChild(div);
        });
    } catch (error) {
        console.error('Errorea menu-a kargatzean:', error);
        document.getElementById('produktu-botoiak').innerHTML = '<p style="color: var(--danger);">Errorea kargatzean.</p>';
    }
}

function gehituTiketera(id, izena, prezioa) {
    const existitzenDa = eskaera.findIndex(item => item.id === id);

    if (existitzenDa !== -1) {
        eskaera[existitzenDa].kantitatea += 1;
    } else {
        eskaera.push({ id, izena, prezioa: parseFloat(prezioa), kantitatea: 1 });
    }
    
    kalkulatuTotala();
}

function kenduTiketatikBat(id) {
    const index = eskaera.findIndex(item => item.id === id);
    
    if (index !== -1) {
        eskaera[index].kantitatea -= 1;
        if (eskaera[index].kantitatea <= 0) {
            eskaera.splice(index, 1);
        }
        kalkulatuTotala();
    }
}

function kenduTiketatik(index) {
    eskaera.splice(index, 1);
    kalkulatuTotala();
}

function kalkulatuTotala() {
    totala = 0;
    const tiketLerroak = document.getElementById('tiket-lerroak');
    tiketLerroak.innerHTML = '';

    eskaera.forEach((item, index) => {
        const lerroarenPrezioa = item.prezioa * item.kantitatea;
        totala += lerroarenPrezioa;

        const div = document.createElement('div');
        div.className = 'tiket-item';
        div.innerHTML = `
            <div class="tiket-item-info">
                <span class="tiket-kantitatea">x${item.kantitatea}</span>
                <span>${item.izena}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <b>${lerroarenPrezioa.toFixed(2)} €</b>
                <button class="ezabatu-btn" onclick="kenduTiketatik(${index})">X</button>
            </div>
        `;
        tiketLerroak.appendChild(div);
    });

    document.getElementById('totala-text').textContent = `${totala.toFixed(2)} €`;
    kalkulatuBueltak(); 
}

function kalkulatuBueltak() {
    const emandakoDirua = parseFloat(document.getElementById('emandako-dirua').value) || 0;
    const bueltak = emandakoDirua - totala;
    const bueltakText = document.getElementById('bueltak-text');

    if (emandakoDirua === 0 || bueltak < 0) {
        bueltakText.textContent = "0.00 €";
        bueltakText.style.color = "#FF3B30"; 
    } else {
        bueltakText.textContent = `${bueltak.toFixed(2)} €`;
        bueltakText.style.color = "#10B981"; 
    }
}

function erakutsiMezua(testua) {
    const laukia = document.getElementById('mezu-laukia');
    laukia.textContent = testua;
    laukia.classList.add('erakutsi'); 

    setTimeout(() => {
        laukia.classList.remove('erakutsi');
    }, 4000);
}

async function kobratu() {
    if (eskaera.length === 0) {
        alert('Saskia hutsik dago!');
        return;
    }

    const emandakoDirua = parseFloat(document.getElementById('emandako-dirua').value) || 0;
    
    if (emandakoDirua > 0 && emandakoDirua < totala) {
        alert('Bezeroak emandako dirua ez da nahikoa!');
        return;
    }

    try {
        const response = await fetch('/caja/api/kobratu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eskaera: eskaera, totala: totala })
        });
        
        const data = await response.json();

        if (data.success) {
            const bueltakText = document.getElementById('bueltak-text').textContent;
            const emandakoDiruaText = emandakoDirua || totala; 
            
            inprimatuTiketa(eskaera, totala, emandakoDiruaText, bueltakText);
            
            erakutsiMezua(`Eskaera ondo kobratu da! Bueltak: ${bueltakText}`);
            
            eskaera = [];
            document.getElementById('emandako-dirua').value = '';
            kalkulatuTotala();
            kargatuMenuBotoiak(); // Stocka berehala eguneratzen dugu!
        } else {
            alert('Errorea gertatu da: ' + data.msg);
        }
    } catch (error) {
        console.error('Konexio errorea:', error);
        alert('Zerbitzariarekin konexio errorea egon da.');
    }
}

function inprimatuTiketa(eskaeraDatuak, totalaDatuak, emandakoa, bueltak) {
    const ticketWindow = window.open('', '_blank', 'width=400,height=600');

    const dataOrdua = new Date().toLocaleString('eu-ES', { 
        year: 'numeric', month: '2-digit', day: '2-digit', 
        hour: '2-digit', minute: '2-digit' 
    });

    let ticketHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @page { 
                    margin: 0; 
                    size: 78mm auto; 
                }
                
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 14px;
                    color: #000;
                }
                
                .ticket-container {
                    width: 64mm; 
                    margin: 0 auto; 
                }
                
                /* Orrialde berria sortzeko klasea (tiket txikientzat) */
                .orrialde-berria {
                    page-break-before: always;
                    break-before: page;
                }
                
                table, tr, td, .totals-table, .center {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                
                .center { text-align: center; }
                .bold { font-weight: bold; }
                .line { border-bottom: 1px dashed #000; margin: 8px 0; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
                td { padding: 4px 0; vertical-align: top; }
                .qty { width: 15%; }
                .name { width: 55%; }
                .price { width: 30%; text-align: right; }
                .totals-table { margin-top: 10px; }
                .totals-table td { padding: 2px 0; }
                .totals-label { text-align: right; padding-right: 15px; }
                .totals-value { text-align: right; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="ticket-container">
                <div class="center">
                    <h1 style="margin: 0; font-size: 24px;">ART</h1>
                    <h2 style="margin: 0; font-size: 16px;">Garagardo Azoka</h2>
                    <p style="margin: 5px 0 10px 0; font-size: 12px;">${dataOrdua}</p>
                </div>
                <div class="line"></div>
                <table>
    `;

    eskaeraDatuak.forEach(item => {
        const lerroPrezioa = (item.prezioa * item.kantitatea).toFixed(2);
        ticketHTML += `
                    <tr>
                        <td class="qty">${item.kantitatea}x</td>
                        <td class="name">${item.izena}</td>
                        <td class="price">${lerroPrezioa} €</td>
                    </tr>
        `;
    });

    ticketHTML += `
                </table>
                <div class="line"></div>
                <table class="totals-table">
                    <tr>
                        <td class="totals-label bold" style="font-size: 18px;">TOTALA:</td>
                        <td class="totals-value" style="font-size: 18px;">${totalaDatuak.toFixed(2)} €</td>
                    </tr>
                    <tr>
                        <td class="totals-label">Eskudirua:</td>
                        <td class="totals-value">${emandakoa.toFixed(2)} €</td>
                    </tr>
                    <tr>
                        <td class="totals-label">Bueltak:</td>
                        <td class="totals-value">${bueltak}</td>
                    </tr>
                </table>
                <div class="line"></div>
                <div class="center" style="margin-top: 15px;">
                    <p>Eskerrik asko zure bisitagatik!</p>
                </div>
            </div>
    `;

    // 2. TIKET TXIKIAK (Banakakoak, barrarako)
    eskaeraDatuak.forEach(item => {
        // Baldintza: Ez badu "jarra utzik" izena (letra larri/xeheak kontuan hartu gabe)
        if (item.izena.toLowerCase() !== 'jarra utzik') {
            
            // Kantitatea zenbat den, hainbeste tiket txiki inprimatu
            for (let i = 0; i < item.kantitatea; i++) {
                ticketHTML += `
                    <div class="orrialde-berria"></div>
                    
                    <div class="ticket-container">
                        <div class="center" style="margin-top: 10px;">
                            <h2 style="margin: 0 0 5px 0; font-size: 14px;">Arrasate Rugby Taldea</h2>
                            <div class="line"></div>
                            
                            <h1 style="font-size: 22px; margin: 20px 0; text-transform: uppercase;">
                                ${item.izena}
                            </h1>
                            
                            <div class="line"></div>
                            <div style="color: white; padding-top: 75mm; line-height: 1px;">.</div>
                        </div>
                    </div>
                `;
            }
        }
    });

    ticketHTML += `
            <script>
                window.onload = function() { 
                    setTimeout(() => { 
                        window.print(); 
                        window.close(); 
                    }, 500);
                }
            </script>
        </body>
        </html>
    `;

    ticketWindow.document.write(ticketHTML);
    ticketWindow.document.close();
}
