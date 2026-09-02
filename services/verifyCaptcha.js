const HCAPTCHA_VERIFY_URL = 'https://api.hcaptcha.com/siteverify';

// Verifies the "h-captcha-response" token hCaptcha's widget adds to the form.
// If no secret is configured (e.g. local dev without hCaptcha set up yet),
// verification is skipped so the form still works without it.
async function verifyCaptcha(token, remoteip) {
    const secret = process.env.HCAPTCHA_SECRET_KEY;
    if (!secret) return true;
    if (!token) return false;

    const params = new URLSearchParams({ secret, response: token });
    if (remoteip) params.set('remoteip', remoteip);

    try {
        const response = await fetch(HCAPTCHA_VERIFY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
        });
        const data = await response.json();
        return data.success === true;
    } catch (error) {
        console.error('hCaptcha verification request failed:', error);
        return false;
    }
}

module.exports = { verifyCaptcha };
