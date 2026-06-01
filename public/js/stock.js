document.addEventListener('DOMContentLoaded', () => {
    kargatuProduktuak();
    setInterval(() => {
        // Egiaztatu ea kaxaren bat editatzen ari den (ikusgarri dagoen)
        const editatzenAriDira = document.querySelectorAll('.edit-input[style*="display: inline-block"]').length > 0;
        
        // Inor ez bada editatzen ari, orduan bai, taula eguneratu
        if (!editatzenAriDira) {
            kargatuProduktuak();
        }
    }, 5000);
});

async function kargatuProduktuak() {
    try {
        const response = await fetch('/stock/api/productos');
        
        if (!response.ok) throw new Error('Konexio errorea');
        
        const produktuak = await response.json();
        margotuTaula(produktuak);

    } catch (error) {
        console.error('Errorea datuak kargatzean:', error);
        document.getElementById('taula-gorputza').innerHTML = `
            <tr><td colspan="3" align="center" style="color: #FF3B30; font-weight: bold; padding: 40px;">Errorea datuak kargatzean. Zerbitzaria piztuta dago?</td></tr>
        `;
    }
}

function margotuTaula(produktuak) {
    const tbody = document.getElementById('taula-gorputza');
    tbody.innerHTML = ''; 

    produktuak.forEach(prod => {
        const tr = document.createElement('tr');
        
        // Segurtasunerako, datu-baseko "precio" (ES) erabiltzen dela bermatzen dugu
        const prezioaDB = parseFloat(prod.precio || prod.prezioa || 0);
        
        tr.innerHTML = `
            <td class="produktu-izena">${prod.izena}</td>
            
            <td>
                <div class="cell-content">
                    <span id="prezioa-text-${prod.id}" class="item-text">${prezioaDB.toFixed(2)} €</span>
                    <input type="number" id="prezioa-input-${prod.id}" class="edit-input" value="${prezioaDB}" step="0.5">
                    
                    <div>
                        <button id="prezioa-edit-btn-${prod.id}" class="action-btn edit-btn" onclick="editatzekoModua(${prod.id}, 'prezioa')">Editatu</button>
                        <button id="prezioa-save-btn-${prod.id}" class="action-btn save-btn" onclick="gordeAldaketa(${prod.id}, 'prezioa')">Gorde</button>
                    </div>
                </div>
            </td>
            
            <td>
                <div class="cell-content">
                    <span id="stock-text-${prod.id}" class="item-text">${prod.stock}</span>
                    <input type="number" id="stock-input-${prod.id}" class="edit-input" value="${prod.stock}">
                    
                    <div>
                        <button id="stock-edit-btn-${prod.id}" class="action-btn edit-btn" onclick="editatzekoModua(${prod.id}, 'stock')">Editatu</button>
                        <button id="stock-save-btn-${prod.id}" class="action-btn save-btn" onclick="gordeAldaketa(${prod.id}, 'stock')">Gorde</button>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function editatzekoModua(id, eremua) {
    document.getElementById(`${eremua}-text-${id}`).style.display = 'none';
    document.getElementById(`${eremua}-edit-btn-${id}`).style.display = 'none';
    
    document.getElementById(`${eremua}-input-${id}`).style.display = 'inline-block';
    document.getElementById(`${eremua}-save-btn-${id}`).style.display = 'inline-block';
}

async function gordeAldaketa(id, eremua) {
    const balioBerria = document.getElementById(`${eremua}-input-${id}`).value;
    
    try {
        const response = await fetch(`/stock/api/eguneratu/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eremua: eremua, balioa: balioBerria })
        });
        
        if (response.ok) {
            // Testua eguneratu pantailan
            let testua = balioBerria;
            if (eremua === 'prezioa') {
                testua = parseFloat(balioBerria).toFixed(2) + ' €';
            }
            
            document.getElementById(`${eremua}-text-${id}`).textContent = testua;
            
            // Botoiak hasierako egoerara itzuli
            document.getElementById(`${eremua}-text-${id}`).style.display = 'inline-block';
            document.getElementById(`${eremua}-edit-btn-${id}`).style.display = 'inline-block';
            document.getElementById(`${eremua}-input-${id}`).style.display = 'none';
            document.getElementById(`${eremua}-save-btn-${id}`).style.display = 'none';
        } else {
            alert('Errorea gertatu da aldaketa gordetzean.');
        }
    } catch (error) {
        console.error('Errorea:', error);
        alert('Konexio errorea zerbitzariarekin.');
    }
}
