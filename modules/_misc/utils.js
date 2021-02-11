window.utils = {
    html: {
        fetch: file => fetch(file).then(c => c.text()),
        load: file => window.utils.html.fetch(file).then(c => $("#modules").html(c)),
        append: file => window.utils.html.fetch(file).then(c => $("#modules").append(c))
    },

    css: {
        load: function (file) {
            if(document.querySelectorAll(`link[href='${file}']`).length > 0) return

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

    sw: {
        asd: window.onload = function () {
            return
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/nopass/sw.js', { scope: '/nopass/' })
                    .then((registration) => {
                        const data = {
                            type: 'CACHE_URLS',
                            payload: [
                                location.href,
                                ...performance.getEntriesByType('resource').map((r) => r.name)
                            ]
                        };
                        registration?.active?.postMessage(data);
                    })
                    .catch((err) => console.log('SW registration FAIL:', err));
            }
        }
    }
}
