const micBtn = document.getElementById('mic-btn');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn');
const finalTextSpan = document.getElementById('final-text');
const guessedTextSpan = document.getElementById('guessed-text');

// Initialize the Web Speech API
// interimResults is a property of the Web Speech API 
// .continuous is a boolean property that dictates whether the microphone keeps listening after taking a breath
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let isRecording = false;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;      // Keep listening until stopped
    recognition.interimResults = true;  // Show words as you speak
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

        // Append final words and show live guessing words
        finalTextSpan.innerHTML += finalTranscript;
        // FIXED: Used the correct variable name defined at the top
        guessedTextSpan.innerHTML = interimTranscript; 
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
    micBtn.textContent = "Browser Not Supported";
    micBtn.disabled = true;
    alert("Sorry! Your browser does not support the Web Speech API. Try Chrome or Edge.");
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
    // FIXED: Used the correct variable name defined at the top
    guessedTextSpan.innerHTML = '';
});
