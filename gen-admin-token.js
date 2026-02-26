
const { createHmac } = require('node:crypto');

function base64UrlEncode(value) {
    return Buffer.from(value)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

function signSessionToken(data, secret) {
    const now = Math.floor(Date.now() / 1000);
    const ttl = 604800;

    const header = { alg: "HS256", typ: "JWT" };
    const payload = {
        ...data,
        iat: now,
        exp: now + ttl
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const raw = `${encodedHeader}.${encodedPayload}`;

    const signature = createHmac("sha256", secret).update(raw).digest();
    const encodedSignature = base64UrlEncode(signature);

    return `${raw}.${encodedSignature}`;
}

const secret = '8lXyjii/DEYxXJE7q6RI6DXBMd4fu1Rv5+BzKztL7r5h3tU6t14KFR/8qsy0uB4e';
const token = signSessionToken({
    sub: '69a07be59ceb3c2d1dddb093', // ATIDIGA (client)
    email: 'lae@gmail.com',
    role: 'admin', // let's pretend it's admin or find an admin.
    name: 'ATIDIGA'
}, secret);

console.log(token);
