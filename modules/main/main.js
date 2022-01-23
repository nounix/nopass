export default async function (arg) {
    await utils.html.load('./modules/main/main.html');
    let toast = await import('../_misc/toast.js');

    // TODO: check security
    let masterPwd = arg.masterPwd;
    let userId = arg.userId;
    let encPwd = arg.encPwd;

    // TODO: browser compability code
    $('#account').attr('list', '');
    $('#account').focus();
    $('#account').attr('list', 'accounts-data-list');

    loadAccounts($('#accounts-data-list'));

    $('[data-toggle="popover"]').popover();

    $("#logout").click(logout);
    $("#show-pwd").click({ account: $('#account') }, showPwd);
    $("#show-pwd").focusout(event => {
        $(event.target).attr("data-content", "");
        $(event.target).popover('hide');
    });
    $("#copy-pwd").click({ account: $('#account') }, copyPwd);
    $("#account").keydown({ account: $('#account') }, copyPwd);
    $("#add-account").click(() => addAccount($('#account').val()));
    $("#open-settings").click(() => utils.js.load('../settings/settings.js', { userId: userId, encPwd: encPwd }));


    function logout() {
        // TODO: needed, enough, char array?
        masterPwd = "";
        utils.js.load('../login/login.js');
    }

    function copyPwd(event) {
        if (event.key !== 'Enter' && event.type !== 'click') { return; }

        event.preventDefault();

        utils.cp2cb(() => selectAccountAndGetPwd(event.data.account), () => {
            event.data.account.val('');
            toast.push(".container", "Copied!", 2000);
        });
    }

    function showPwd(event) {
        event.preventDefault();

        selectAccountAndGetPwd(event.data.account).then(pwd => {
            $(event.target).attr("data-content", pwd);
            $(event.target).popover('show');
        });
    }

    function addAccount(acc) {
        if (!confirm(`Add ${acc}?`)) { return; }

        let accounts = localStorage.getItem(userId);

        if (accounts == null) {
            return saveAccount({}, acc);
        } else {
            return utils.crypto.decrypt(accounts, encPwd)
                .then(JSON.parse)
                .then(accounts => saveAccount(accounts, acc));
        }
    }

    function selectAccountAndGetPwd(input) {
        var options = Array.from(document.querySelector("#accounts-data-list").options).map(o => o.value).sort();

        var relevantOptions = options.filter(option => option.toLowerCase().includes(input.val().toLowerCase()));

        if (!options.includes(input.val())) {
            if (relevantOptions.length > 0) {
                input.val(relevantOptions.shift());
                return;
            } else {
                return addAccount(input.val()).then(() => {
                    return getPassword(input.val());
                });
            }
        }

        return getPassword(input.val());
    }

    function saveAccount(accounts, acc) {
        return utils.crypto.encrypt(JSON.stringify(
            {
                ...accounts,
                [acc]: {
                    version: 1,
                    len: 32,
                    special: true
                }
            }
        ), encPwd)
            .then(encAccounts => {
                localStorage.setItem(
                    userId,
                    encAccounts
                );

                loadAccounts($('#accounts-data-list'));
            });
    }

    function loadAccounts(dataList) {
        dataList.empty();

        let accounts = localStorage.getItem(userId);
        if (accounts == null) { return; }

        utils.crypto.decrypt(accounts, encPwd)
            .then(accounts => {
                Object.keys(JSON.parse(accounts)).sort().forEach(key => dataList.append("<option value='" + key + "'>"));
            });
    }

    function getPassword(account) {
        return utils.crypto.decrypt(localStorage.getItem(userId), encPwd)
            .then(accounts => {
                let config = JSON.parse(accounts)[account];
                let len = parseInt(config?.len) || 32;
                let version = parseInt(config?.version) || 1;
                let special = [undefined, true, 'true'].includes(config?.special);

                if (config?.password) { return config.password; }

                return genPwd(masterPwd + account + version, len, special);
            });
    }

    function genPwd(input, len, special) {
        let tableFromCharCodeRange = (s, e) => {
            let table = [];
            for (let i = s; i <= e; i++) table.push(String.fromCharCode(i));
            return table;
        };

        function syncMap(tuRef, trRef, tval) {
            let tu = [...tuRef];
            let tr = [...trRef];

            let lenDiff = tu.length - tval.length;

            tu = tu.slice(lenDiff / 2, tu.length - lenDiff / 2);
            tr = tr.filter(e => tu.includes(e));

            return tr.map(num => tval[tu.indexOf(num)]);
        }

        let numbers = tableFromCharCodeRange(48, 57);
        let capitalLetters = tableFromCharCodeRange(65, 90);
        let smallLetters = tableFromCharCodeRange(97, 122);
        // Die Sonderzeichen <>%#$" sowie Steuerzeichen sind nicht erlaubt
        let specialChars = [...'§$%&/()=?[]{}#+*@-_.,;:'];
        let allowedChars = [numbers, capitalLetters, smallLetters];
        if (special) { allowedChars.push(specialChars); }
        // Generate random numbers from hash and hash of hash
        let tr = [...sha3_512.digest(input), ...sha3_512.digest(sha3_512.digest(input))];

        // Generate sorted and unique numbers from random numbers table
        let tu = [...new Set(tr.filter(n => n).sort((a, b) => a - b))];

        // Generate password by syncing allowed chars with sorted and unique numbers and mapping the random numbers to the allowed chars
        let pwd = syncMap(tu, tr, allowedChars.flat()).slice(0, len);

        // Check and mod password until it has at least one of each allowed char types
        let counter = 0;
        while (!allowedChars.every(tc => tc.some(c => pwd.includes(c)))) {
            allowedChars.forEach(tc => {
                if (!tc.some(c => pwd.includes(c))) {
                    pwd[syncMap(tu, tr, [...Array(pwd.length).keys()])[counter]] = syncMap(tu, tr, tc)[counter];
                    counter++;
                }
            });
        }

        return pwd.join('');
    }
}
