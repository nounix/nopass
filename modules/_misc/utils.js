import '../_vendor/scripts/jquery.slim.min.js';

window.utils = {
    html: {
        fetch: file => fetch(file).then(c => c.text()),
        load: file => window.utils.html.fetch(file).then(c => $("#modules").html(c)),
        append: file => window.utils.html.fetch(file).then(c => $("#modules").append(c))
    },

    css: {
        load: function (file) {
            if (document.querySelectorAll(`link[href='${file}']`).length > 0) { return; }

            let link = document.createElement('link');

            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = file;

            document.getElementsByTagName('head')[0].append(link);
        }
    },

    js: {
        load: (file, arg) => import(file).then(module => module.default?.(arg))
    },

    crypto: {
        // (c) Chris Veness MIT Licence: https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a/e40cd0f5237aedcfc4641ad728f119b48f4b5082
        encrypt: (plaintext, password) => {
            const pwUtf8 = new TextEncoder().encode(password);

            return crypto.subtle.digest('SHA-256', pwUtf8).then(pwHash => {
                const iv = crypto.getRandomValues(new Uint8Array(16));
                const ivStr = Array.from(iv).map(b => String.fromCharCode(b)).join('');
                const alg = { name: 'AES-GCM', iv: iv };

                return crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']).then(key => {
                    const ptUint8 = new TextEncoder().encode(plaintext);

                    return crypto.subtle.encrypt(alg, key, ptUint8).then(ctBuffer => {
                        const ctArray = Array.from(new Uint8Array(ctBuffer));
                        const ctStr = ctArray.map(byte => String.fromCharCode(byte)).join('');

                        return btoa(ivStr + ctStr);
                    });
                });
            });
        },

        decrypt: (ciphertext, password) => {
            const pwUtf8 = new TextEncoder().encode(password);

            return crypto.subtle.digest('SHA-256', pwUtf8).then(pwHash => {
                const ivStr = atob(ciphertext).slice(0, 16);
                const iv = new Uint8Array(Array.from(ivStr).map(ch => ch.charCodeAt(0)));
                const alg = { name: 'AES-GCM', iv: iv };

                return crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']).then(key => {
                    const ctStr = atob(ciphertext).slice(16);
                    const ctUint8 = new Uint8Array(Array.from(ctStr).map(ch => ch.charCodeAt(0)));

                    return crypto.subtle.decrypt(alg, key, ctUint8).then(plainBuffer => {
                        const plaintext = new TextDecoder().decode(plainBuffer);
                        return plaintext;
                    });
                });
            });
        }
    },

    cp2cb: (promise, callback) => {
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            navigator.clipboard.write([new ClipboardItem({
                'text/plain': promise().then((data) => {
                    return Promise.resolve(new Blob([data]));
                })
            })]).then(callback);
        } else {
            promise().then(data => navigator.clipboard.writeText(data)).then(callback);
        }
    }
};
