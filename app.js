if (typeof window.otplib === 'undefined') {
    console.error('otplib failed to load.');
    alert('Failed to load OTP library. Please check your internet connection.');
}
const authenticator = window.otplib.authenticator;

authenticator.options = { window: 1 };

const APP_NAME = 'SecureAuthDemo';
const USER = 'user@example.com';

let secretKey = '';

const qrCodeContainer = document.getElementById('qrcode');
const secretKeyDisplay = document.getElementById('secret-key');
const copyBtn = document.getElementById('copy-btn');
const otpInput = document.getElementById('otp-input');
const verifyBtn = document.getElementById('verify-btn');
const verificationResult = document.getElementById('verification-result');

function initializeAuth() {
    
    secretKey = authenticator.generateSecret();
    
    
    const formattedSecret = secretKey.match(/.{1,4}/g).join(' ');
    secretKeyDisplay.textContent = formattedSecret;

    
    const otpauth = authenticator.keyuri(USER, APP_NAME, secretKey);

    
    qrCodeContainer.innerHTML = '';
    
    
    new QRCode(qrCodeContainer, {
        text: otpauth,
        width: 150,
        height: 150,
        colorDark : "#0f172a",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.M
    });
}


copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(secretKey).then(() => {
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        setTimeout(() => {
            copyBtn.innerHTML = originalIcon;
        }, 2000);
    });
});


function verifyOTP() {
    const inputCode = otpInput.value.replace(/\s/g, ''); // Remove any spaces
    
    if (inputCode.length !== 6 || !/^\d+$/.test(inputCode)) {
        showResult('Please enter a valid 6-digit code.', 'error');
        return;
    }

    try {
        // Temporarily set larger window to allow for time drift
        const originalOptions = authenticator.options;
        authenticator.options = { window: 2 };
        
        const isValid = authenticator.check(inputCode, secretKey);
        
        // Restore original options
        authenticator.options = originalOptions;

        if (isValid) {
            showResult('Authentication Successful! Valid code.', 'success');
            otpInput.value = ''; // Clear on success
        } else {
            showResult('Invalid or expired code. Please try again.', 'error');
        }
    } catch (err) {
        showResult('Error verifying code.', 'error');
        console.error(err);
    }
}

function showResult(message, type) {
    verificationResult.textContent = message;
    verificationResult.className = `result-message ${type}`;
    
    
    if (type === 'success') {
        setTimeout(() => {
            verificationResult.className = 'result-message hidden';
        }, 3000);
    }
}


verifyBtn.addEventListener('click', verifyOTP);
otpInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        verifyOTP();
    }
});

// Initialize the authenticator when page loads
initializeAuth();

otpInput.addEventListener('input', (e) => {
    
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
});


window.addEventListener('DOMContentLoaded', initializeAuth);
