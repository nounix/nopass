export default async function (arg) {
    'use strict';

    // Init
    await utils.html.load('./modules/main/main.html')
    let toast = await import('../_misc/toast.js');
    // TODO: check security
    let masterPwd = arg

    // TODO: browser compability code
    $('#account').attr('list', '')
    $('#account').focus()
    $('#account').attr('list', 'asdl')

    loadAccountDataList($('#asdl'))

    $('[data-toggle="popover"]').popover()

    $("#logout").click(logout);
    $("#show-pwd").click({ account: $('#account') }, showPwd);
    $("#copy-pwd").click({ account: $('#account') }, copyPwd);
    $("#account").keydown({ account: $('#account') }, copyPwd);
    $("#add-account").click(() => addAccount($('#account').val()));
    $("#openSettings").click(() => utils.js.load('../settings/settings.js'));


    function logout() {
        // TODO: needed?
        masterPwd = ""
        utils.js.load('../login/login.js')
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
                addAccount(event.data.account.val())
        }

        navigator.clipboard.writeText(getPassword(event.data.account.val()))
        event.data.account.val('')
        toast.push(".container", "Copied!", 2000)
    }

    function showPwd(event) {
        event.preventDefault()

        var options = Array.from(document.querySelector("#asdl").options).map(o => o.value).sort()

        if (!options.includes(event.data.account.val())) addAccount(event.data.account.val())

        $(event.target).attr("data-content", getPassword(event.data.account.val()))
        $(event.target).popover('show')
    }

    function addAccount(acc) {
        if (!confirm(`Add ${acc}?`)) return

        localStorage.setItem(
            acc,
            JSON.stringify({
                version: 1,
                len: 32,
                special: true,
            })
        )

        loadAccountDataList($('#asdl'))
    }

    function loadAccountDataList(dataList) {
        dataList.empty();
        Object.keys(localStorage).sort().forEach(key => dataList.append("<option value='" + key + "'>"));
    }

    function getPassword(account) {
        let config = JSON.parse(localStorage.getItem(account))
        let len = config?.len || 32
        let version = config?.version || 1
        let special = (config?.special === undefined) ? true : config?.special

        if (config.password) return config.password

        return genPwd(masterPwd + account + version, len, special)
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

        function hash(input, count) {
            // testasd
            // https://security.stackexchange.com/questions/3959/recommended-of-iterations-when-using-pkbdf2-sha256
            for (let i = 0; i < count; i++) {
                input = sha3_512.digest(input)
            }

            return input
        }

        let numbers = tableFromCharCodeRange(48, 57)
        let capitalLetters = tableFromCharCodeRange(65, 90)
        let smallLetters = tableFromCharCodeRange(97, 122)
        let specialChars = [...'§$%&/()=?[]{}#+*@-_.,;:']
        let allowedChars = [numbers, capitalLetters, smallLetters]
        if (special) allowedChars.push(specialChars)

        // Generate random numbers from hash of hash
        let tr = [...hash(input, 2**16), ...hash(input, 2**16+1)]

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
}
