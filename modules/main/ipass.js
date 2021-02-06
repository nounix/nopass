window.onload = function () {
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
};

export function init(qwe) {
    'use strict';

    fetch("modules/main/main.html").then(c => c.text()).then(c => $("#modules").html(c)).then(() => asd(qwe))
}

function asd(qwe) {
    // TODO: check security
    let masterPwd = qwe

    $('#account').focus()

    loadAccountsList()

    // Init popver
    $('[data-toggle="popover"]').popover()

    // Init toast
    $('.toast').toast()

    // Init buttons
    $("#logout").click(logout);
    $("#account").keydown({ account: $('#account') }, copyPwd);
    $("#copy-pwd").click({ account: $('#account') }, copyPwd);
    $("#show-pwd").click({ account: $('#account') }, showPwd);
    $("#openSettings").click(openSettings);
    $("#add-account").click(() => addAccount($('#account-settings')));
    $("#remove-account").click(() => removeAccount($('#account-settings')));


    function loadAccountsList() {
        $('#asdl').empty();
        Object.keys(localStorage).sort().forEach(key => $('#asdl').append("<option value='" + key + "'>"));
    }

    function logout() {
        masterPwd = ""
        $('#unlocked-view').removeClass("d-block");
        $('#unlocked-view').addClass("d-none");
        $('#locked-view').removeClass("d-none");
        $('#locked-view').addClass("d-block");
        $('#master-password').focus()
    }

    function addNewAccount(acc) {
        if (!confirm(`Add ${acc}?`)) return

        localStorage.setItem(
            acc,
            JSON.stringify({
                version: 1,
                len: 32,
                special: true,
            })
        )

        loadAccountsList()
    }

    function copyPwd(event) {
        if (event.key !== 'Enter' && event.type !== 'click') return

        event.preventDefault()

        var input = event.data.account;
        var options = Array.from(document.querySelector("#asdl").options).map(o => o.value).sort()

        var relevantOptions = options.filter(option => option.toLowerCase().includes(input.val().toLowerCase()));

        if (!options.includes(input.val())) {
            if (relevantOptions.length > 0) {
                input.val(relevantOptions.shift());
                return
            } else
                addNewAccount(event.data.account.val())
        }

        navigator.clipboard.writeText(getPassword(event.data.account.val()))
        event.data.account.val('')
        $('.toast').toast('show')
    }

    function showPwd(event) {
        event.preventDefault()

        var options = Array.from(document.querySelector("#asdl").options).map(o => o.value).sort()

        if (!options.includes(event.data.account.val())) addNewAccount(event.data.account.val())

        $(event.target).attr("data-content", getPassword(event.data.account.val()))
        $(event.target).popover('show')
    }

    function getPassword(account) {
        let config = JSON.parse(localStorage.getItem(account))
        let len = config?.len || 32
        let version = config?.version || 1
        let special = (config?.special === undefined) ? true : config?.special

        return genPwd(qwe + account + version, len, special)
    }

    function genPwd(input, len, special) {
        let tableFromCharCodeRange = (s, e) => {
            let table = [];
            for (let i = s; i <= e; i++) table.push(String.fromCharCode(i));
            return table
        }

        function syncMap(tuRef, trRef, tval) {
            let tu = [...tuRef];
            let tr = [...trRef];

            let lenDiff = tu.length - tval.length

            tu = tu.slice(lenDiff / 2, tu.length - lenDiff / 2)
            tr = tr.filter(e => tu.includes(e))

            return tr.map(num => tval[tu.indexOf(num)])
        }

        let numbers = tableFromCharCodeRange(48, 57)
        let capitalLetters = tableFromCharCodeRange(65, 90)
        let smallLetters = tableFromCharCodeRange(97, 122)
        let specialChars = [...'§$%&/()=?[]{}#+*@-_.,;:']
        let allowedChars = [numbers, capitalLetters, smallLetters]
        if (special) allowedChars.push(specialChars)

        // Generate random numbers from hash and hash of hash
        let tr = [...sha3_512.digest(input), ...sha3_512.digest(sha3_512.digest(input))]

        // Generate sorted and unique numbers from random numbers table
        let tu = [...new Set(tr.filter(n => n).sort((a, b) => a - b))];

        // Generate password by syncing allowed chars with sorted and unique numbers and mapping the random numbers to the allowed chars
        let pwd = syncMap(tu, tr, allowedChars.flat()).slice(0, len)

        // Check and mod password until it has at least one of each allowed char types
        let counter = 0;
        while (!allowedChars.every(tc => tc.some(c => pwd.includes(c)))) {
            allowedChars.forEach(tc => {
                if (!tc.some(c => pwd.includes(c))) {
                    pwd[syncMap(tu, tr, [...Array(pwd.length).keys()])[counter]] = syncMap(tu, tr, tc)[counter]
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
}