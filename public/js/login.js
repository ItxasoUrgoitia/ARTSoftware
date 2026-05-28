document.getElementById('login-form').addEventListener('submit', async (e) => {
    // Nabigatzaileak ez dezala orria birkargatu (horrela erroreak poliki erakutsi ditzakegu)
    e.preventDefault();
    
    const pin = document.getElementById('pin-input').value;
    const errorMsg = document.getElementById('error-msg');

    try {
        // Zerbitzariari PIN-a bidaltzen diogu
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: pin })
        });

        const result = await response.json();

        if (result.success) {
            // PIN-a zuzena bada, zerbitzariak esandako lekura joango gara (/caja, /sukaldea edo /stock)
            window.location.href = result.redirect;
        } else {
            // PIN-a okerra bada, errorea erakutsi eta laukia hustu
            errorMsg.textContent = result.msg || 'PIN okerra. Saiatu berriro.';
            errorMsg.style.display = 'block';
            document.getElementById('pin-input').value = '';
        }
    } catch (error) {
        console.error('Errorea:', error);
        errorMsg.textContent = 'Zerbitzariarekin konexio errorea egon da.';
        errorMsg.style.display = 'block';
    }
});