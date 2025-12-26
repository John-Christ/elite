

  
(function() {
    let selectedProfile = "Général";

    window.setProfile = function(profile) {
        selectedProfile = profile;
        const items = document.querySelectorAll('.catalog-item');
        items.forEach(item => item.style.borderColor = '#333');
        if (event && event.currentTarget) event.currentTarget.style.borderColor = 'var(--primary)';
    };







    document.addEventListener('DOMContentLoaded', () => {
        const imageInput = document.getElementById('image-input');
        const scanButton = document.getElementById('scan-button');
        const preview = document.getElementById('preview');
        const resultsContent = document.getElementById('results-content');
        const resultsSection = document.getElementById('results-section');
        const loading = document.getElementById('loading-overlay');
        const voiceBtn = document.getElementById('voice-btn');

        // VOICE FUNCTION
        function speak() {
            let text = resultsContent.innerText.replace(/[*#`]/g, '').trim();
         //   text.lang = 'fr-FR';
            if (!text) return;

            // Try Native Android Voice first
            if (window.Android && window.Android.speak) {
                window.Android.speak(text);
            
          //  const utterance = new SpeechSynthesisUtterance(text);
            // On récupère toutes les voix disponibles sur le téléphone
           //const voices = window.Android.getVoices();
            
            // On cherche spécifiquement une voix française (fr-FR ou fr-CA)
          //  const frenchVoice = voices.find(voice => voice.lang.includes('fr, en'));

           // utterance.voice = frenchVoice;

          //  utterance.lang = 'fr-FR';
           // utterance.pitch = 1.0;
         //   utterance.rate = 1.0;

          //  window.frenchVoice.speak();



            } else {
                // Fallback for Web
                window.speechSynthesis.cancel();
                const msg = new SpeechSynthesisUtterance(text);
                msg.lang = 'fr-FR';
                window.speechSynthesis.speak(msg);
            }
        }


        // IMPORTANT : Charge les voix en arrière-plan (nécessaire pour Chrome/Android)
       // window.speechSynthesis.getVoices();



        if (voiceBtn) voiceBtn.onclick = (e) => { e.preventDefault(); speak(); };

        scanButton.addEventListener('click', () => imageInput.click());

        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                preview.src = event.target.result;
                preview.style.display = 'block';
                loading.style.display = 'block';
                resultsSection.classList.add('hidden');
                if (voiceBtn) voiceBtn.style.display = 'none';

                const base64Data = event.target.result.split(',')[1];
                const prompt = `Analyse cette image pour un profil ${selectedProfile}. Donne le nom, les additifs, le score et un conseil. Réponds en HTML.`;

                google.script.run
                    .withSuccessHandler((res) => {
                        loading.style.display = 'none';
                        resultsSection.classList.remove('hidden');
                        if (voiceBtn) voiceBtn.style.display = 'block';

                         

                        try {
                            const data = JSON.parse(res);
                            resultsContent.innerHTML = data.candidates[0].content.parts[0].text;
                        
                        
                           

                        } catch(e) { resultsContent.innerHTML = res; }
                    })
                    .withFailureHandler((err) => {
                        loading.style.display = 'none';
                        resultsContent.innerHTML = "Erreur: " + err.message;
                    })
                    .analyzeImage({ image: base64Data, fullPrompt: prompt });
            };
            reader.readAsDataURL(file);

          


        });
    });
})();
