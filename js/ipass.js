window.onload = function () {
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
};

$(document).ready(function () {
    'use strict';

    // Init popver
    $('[data-toggle="popover"]').popover()

    // Init toast
    $('.toast').toast()

    // Init buttons
    $("#password-state").click({ input: $('#master-password') }, togglePasswordVisibility);
    $("#master-password").keydown({ input: $('#master-password') }, login);
    $("#login").click({ input: $('#master-password') }, login);
    $("#logout").click(logout);
    $("#account").keydown({ account: $('#account') }, copyPwd);
    $("#copy-pwd").click({ account: $('#account') }, copyPwd);
    $("#show-pwd").click({ account: $('#account') }, showPwd);
    $("#openSettings").click(openSettings);
    $("#add-account").click(() => addAccount($('#account-settings')));
    $("#remove-account").click(() => removeAccount($('#account-settings')));

    // TODO: check security
    let masterPwd

    function togglePasswordVisibility(event) {
        event.preventDefault();

        if (event.data.input.attr("type") == "text") {
            event.data.input.attr('type', 'password');
            $(event.target).addClass("fa-eye");
            $(event.target).removeClass("fa-eye-slash");
        } else {
            event.data.input.attr('type', 'text');
            $(event.target).removeClass("fa-eye");
            $(event.target).addClass("fa-eye-slash");
        }
    }

    function login(event) {
        if (event.key !== undefined && event.key !== 'Enter') return

        event.preventDefault()

        masterPwd = btoa(keccak512.digest(event.data.input.val()))
        event.data.input.val('')
        $('#locked-view').removeClass("d-block");
        $('#locked-view').addClass("d-none");
        $('#unlocked-view').removeClass("d-none");
        $('#unlocked-view').addClass("d-block");
        $('#account').focus()
    }

    function logout(event) {
        masterPwd = ""
        $('#unlocked-view').removeClass("d-block");
        $('#unlocked-view').addClass("d-none");
        $('#locked-view').removeClass("d-none");
        $('#locked-view').addClass("d-block");
        $('#master-password').focus()
    }

    function copyPwd(event) {
        if (event.key !== undefined && event.key !== 'Enter') return

        event.preventDefault()

        navigator.clipboard.writeText(getPassword(event))

        event.data.account.val('')
        $('.toast').toast('show')
    }

    function showPwd(event) {
        event.preventDefault()

        $(event.target).attr("data-content", getPassword(event))
        $(event.target).popover('show')
    }

    function getPassword(event) {
        let account = event.data.account.val()
        let config = JSON.parse(localStorage.getItem(account))
        let len = config?.len || 32
        let version = config?.version || 1
        let special = config?.special || true

        return genPwd(masterPwd + account + version, len, special)
    }

    function genPwd(input, len, special) {
        let tableFromCharCodeRange = (s, e) => {
            let table = [];
            for (let i = s; i <= e; i++) table.push(String.fromCharCode(i));
            return table
        }

        function syncMap(t1, t2, t3) {
            t1 = [...t1];
            let xn = t1.length - t3.length

            t1 = t1.slice(xn / 2, t1.length - xn / 2)
            t2 = t2.filter(e => t1.includes(e))

            return t2.map(num => t3[t1.indexOf(num)])
        }

        let numbers = tableFromCharCodeRange(48, 57)
        let capitalLetters = tableFromCharCodeRange(65, 90)
        let smallLetters = tableFromCharCodeRange(97, 122)
        let specialChars = [...'§$%&/()=?[]{}#+*@-_.,;:']
        let allowedChars = [numbers, capitalLetters, smallLetters]
        if (special) allowedChars.push(specialChars)

        // Generate base64 encoded sha3 hash
        let hash = btoa(keccak512.digest(input))

        // Generate random numbers from hash
        let tr = [];
        for (let i = 0; i < hash.length; i++) {
            tr.push(hash.charCodeAt(i) + hash.charCodeAt(i + 1) + hash.charCodeAt(i + 2));
        }

        // Generate sorted and unique numbers from random numbers table
        let tu = [...new Set(tr.filter(n => n).sort((a, b) => a - b))];

        // Generate password by syncing allowed chars with sorted and unique numbers and mapping the random numbers to the allowed chars
        let pwd = syncMap(tu, tr, allowedChars.flat()).slice(0, len)

        // Check and mod password until it has at least one of each allowed char types
        let counter = 0;
        while (!allowedChars.every(a => a.some(e => pwd.includes(e)))) {
            allowedChars.forEach(e => {
                if (!e.some(num => pwd.join('').includes(num))) {
                    let nindex = syncMap(tu, tr, e)[counter]
                    let pindex = syncMap(tu, tr, [...Array(pwd.length).keys()])[counter]

                    pwd[pindex] = nindex

                    counter++;
                }
            })
        }

        return pwd.join('')
    }

    function openSettings() {
        loadAccounts()
        $('#settings').modal('show')
    }

    function loadAccounts() {
        $("#accounts tr").remove()

        Object.entries(localStorage).forEach(
            ([key, value]) => {
                $('#accounts').append($('<tr>').append(
                    $('<td>').append(key),
                    $('<td>').append(JSON.parse(value).version),
                    $('<td>').append(JSON.parse(value).len),
                    $('<td>').append(JSON.parse(value).special),
                ))
            }
        );
    }

    function addAccount(input) {
        localStorage.setItem(
            input.val().match(/^\S+/)[0],
            JSON.stringify({
                version: input.val().match(/-v\s([0-9]+)/) == null ? 1 : input.val().match(/-v\s([0-9]+)/)[1],
                len: input.val().match(/-l\s([0-9]+)/) == null ? 12 : input.val().match(/-l\s([0-9]+)/)[1],
                special: input.val().match(/-s/) == null ? false : true,
            })
        )

        input.val('')

        loadAccounts()
    }

    function removeAccount(input) {
        localStorage.removeItem(input.val());
        input.val('')
        loadAccounts()
    }
});