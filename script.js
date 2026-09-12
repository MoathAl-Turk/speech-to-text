const micBtn = document.getElementById('mic-btn');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn');
const finalTextSpan = document.getElementById('final-text');
const guessedTextSpan = document.getElementById('guessed-text');

// Initialize the Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let isRecording = false;

// --- NEW FEATURE: Voice Command Dictionary ---
// This function checks the text for spoken commands and replaces them with symbols
function formatTranscript(text) {
    let formatted = text;
    
    // Formatting and Spacing
    formatted = formatted.replace(/\bnew paragraph\b/gi, '\n\n');
    formatted = formatted.replace(/\bnew line\b/gi, '\n');
    
    // Punctuation Marks
    formatted = formatted.replace(/\bcomma\b/gi, ',');
    formatted = formatted.replace(/\bperiod\b/gi, '.');
    formatted = formatted.replace(/\bfull stop\b/gi, '.');
    formatted = formatted.replace(/\bquestion mark\b/gi, '?');
    formatted = formatted.replace(/\bexclamation mark\b/gi, '!');
    formatted = formatted.replace(/\bexclamation point\b/gi, '!');
    formatted = formatted.replace(/\bcolon\b/gi, ':');
    formatted = formatted.replace(/\bsemicolon\b/gi, ';');
    formatted = formatted.replace(/\bhyphen\b/gi, '-');
    formatted = formatted.replace(/\bdash\b/gi, '-');
    
    // Clean up accidental spaces before punctuation (e.g., "Hello ," becomes "Hello,")
    formatted = formatted.replace(/\s+([,.?!:;])/g, '$1');
    
    return formatted;
}

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;      
    recognition.interimResults = true;  
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        isRecording = true;
        micBtn.textContent = "Stop Listening";
        micBtn.classList.add('recording');
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + ' ';
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        // Run both the final and live-guessing text through our formatting function
        finalTextSpan.innerHTML += formatTranscript(finalTranscript);
        guessedTextSpan.innerHTML = formatTranscript(interimTranscript);
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
        isRecording = false;
        micBtn.textContent = "Start Listening";
        micBtn.classList.remove('recording');
        guessedTextSpan.innerHTML = ''; 
    };

    // Toggle recording on button click
    micBtn.addEventListener('click', () => {
        if (isRecording) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });

} else {
    // --- NEW FEATURE: Visible Error Message ---
    micBtn.textContent = "Browser Not Supported";
    micBtn.disabled = true;
    finalTextSpan.innerHTML = "<span style='color: #ff4b4b; font-weight: bold;'>❌ Your browser does not support the Web Speech API. Please try using Google Chrome or Microsoft Edge.</span>";
}

// Utility: Copy text to clipboard
copyBtn.addEventListener('click', () => {
    const textToCopy = finalTextSpan.innerText;
    if (!textToCopy) return;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "Copied!";
        setTimeout(() => copyBtn.textContent = originalText, 2000);
    });
});

// Utility: Clear text
clearBtn.addEventListener('click', () => {
    finalTextSpan.innerHTML = '';
    guessedTextSpan.innerHTML = '';
});
