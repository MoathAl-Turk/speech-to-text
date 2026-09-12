const micBtn = document.getElementById('mic-btn');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn');
const finalTextSpan = document.getElementById('final-text');
const guessedTextSpan = document.getElementById('guessed-text');

// Initialize the Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let isRecording = false;

// --- Voice Command & Punctuation Formatter ---
function formatTranscript(text) {
    let formatted = text;

    // Structural Spacing
    formatted = formatted.replace(/\b(new paragraph|paragraph)\b/gi, '\n\n');
    formatted = formatted.replace(/\b(new line|next line)\b/gi, '\n');

    // Standard Punctuation
    formatted = formatted.replace(/\bcomma\b/gi, ',');
    formatted = formatted.replace(/\b(period|full stop|dot)\b/gi, '.');
    formatted = formatted.replace(/\bquestion mark\b/gi, '?');
    formatted = formatted.replace(/\b(exclamation mark|exclamation point)\b/gi, '!');
    formatted = formatted.replace(/\bcolon\b/gi, ':');
    formatted = formatted.replace(/\bsemicolon\b/gi, ';');
    formatted = formatted.replace(/\b(hyphen|dash)\b/gi, '-');

    // Special Characters & Symbols
    formatted = formatted.replace(/\b(open quote|start quote|open quotes)\b/gi, '"');
    formatted = formatted.replace(/\b(close quote|end quote|close quotes)\b/gi, '"');
    formatted = formatted.replace(/\b(open parenthesis|open bracket)\b/gi, '(');
    formatted = formatted.replace(/\b(close parenthesis|close bracket)\b/gi, ')');
    formatted = formatted.replace(/\b(at sign|at symbol)\b/gi, '@');
    formatted = formatted.replace(/\b(hashtag|hash mark|number sign)\b/gi, '#');
    formatted = formatted.replace(/\b(percent sign|percentage)\b/gi, '%');
    formatted = formatted.replace(/\bampersand\b/gi, '&');
    formatted = formatted.replace(/\basterisk\b/gi, '*');
    formatted = formatted.replace(/\bslash\b/gi, '/');

    // Remove unwanted spaces preceding punctuation marks
    formatted = formatted.replace(/\s+([,.?!:;])/g, '$1');

    // Clean whitespace right after paragraph and line breaks
    formatted = formatted.replace(/\n\s+/g, '\n');

    return formatted;
}

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;      // Keep listening across pauses
    recognition.interimResults = true;  // Stream guesses while speaking
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

        // Apply formatting rules and output text
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

    // Toggle recording state on button click
    micBtn.addEventListener('click', () => {
        if (isRecording) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });

} else {
    // Unsupported Browser State
    micBtn.textContent = "Browser Not Supported";
    micBtn.disabled = true;
    finalTextSpan.innerHTML = "<span style='color: #ff4b4b; font-weight: 600;'>Your browser does not support the Web Speech API. Please use a Chromium-based browser like Google Chrome or Microsoft Edge.</span>";
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
