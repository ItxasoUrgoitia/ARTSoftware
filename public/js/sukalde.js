document.addEventListener('DOMContentLoaded', () => {
    // Orria kargatzean lehenengo deia egin
    kargatuSukaldekoEstatistikak();
    
    // Minuturo datuak automatikoki berritu (60.000 ms)
    setInterval(kargatuSukaldekoEstatistikak, 60000);
});

async function kargatuSukaldekoEstatistikak() {
    const errorBox = document.getElementById('errore-mezua');
    const updateText = document.getElementById('last-update-text');

    try {
        const response = await fetch('/sukalde/api/eskaerak');
        
        if (!response.ok) throw new Error('Konexio errorea');
        
        const datuak = await response.json();
        
        // Pantailako zenbakiak eguneratu
        document.getElementById('num-oilaskoa').textContent = datuak.oilaskoa;
        document.getElementById('num-kodilloa').textContent = datuak.kodilloa;
        document.getElementById('num-edariak').textContent = datuak.edariak;
        
        // Eguneratze-ordua erakutsi
        const orduaObj = new Date();
        const orduaStr = orduaObj.getHours().toString().padStart(2, '0') + ':' + 
                         orduaObj.getMinutes().toString().padStart(2, '0') + ':' + 
                         orduaObj.getSeconds().toString().padStart(2, '0');
                         
        updateText.textContent = `Azken eguneraketa: ${orduaStr}`;
        errorBox.style.display = 'none';

    } catch (error) {
        console.error('Errorea sukaldeko datuak kargatzean:', error);
        errorBox.style.display = 'block';
    }
}