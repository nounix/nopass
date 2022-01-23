export default async function (arg) {
    await utils.html.append('./modules/settings/settings.html');

    let userId = arg.userId;
    let encPwd = arg.encPwd;

    initTable();

    $('#settings').on('hidden.bs.modal', () => $('#settings').remove());
    $('#settings').modal('show');

    function initTable() {
        $("#accounts tr").remove();

        utils.crypto.decrypt(localStorage.getItem(userId), encPwd).then(accounts => {
            accounts = accounts != null ? JSON.parse(accounts) : {};

            Object.entries(accounts).forEach(
                ([key, value]) => {
                    $('#accounts').append($('<tr>').append(
                        $('<td>').append(key),
                        $('<td>').append(value.version),
                        $('<td>').append(value.len),
                        $('<td>').append(value.special),
                        $('<td>').append(value.user),
                        $('<td>').append(value.password),
                        $('<td>').append(
                            $('<button>').addClass('btn fa fa-pen text-white').click(function () {
                                $(this).parents('tr').find('td').each((_key, td) => {
                                    if ($(td).html().includes('button')) {
                                        $(td).replaceWith($('<td>').append(
                                            $('<button>').addClass('btn fa fa-check text-white').click({ accounts: accounts }, saveAccount),
                                            $('<button>').addClass('btn fa fa-times text-white').click(initTable)
                                        ));
                                    }
                                    else {
                                        $(td).html('<input class="form-control input-sm" value="' + $(td).html() + '">');
                                    }
                                });
                            }),
                            $('<button>').addClass('btn fa fa-trash text-white').click({ accounts: accounts }, deleteAccount),
                        ),
                    ));
                }
            );
        });
    }

    function saveAccount(event) {
        let accounts = event.data.accounts;
        let acc = $(this).parents('tr').find('td').toArray().map(val => val.firstChild.value);

        accounts[acc[0]].version = acc[1];
        accounts[acc[0]].len = acc[2];
        accounts[acc[0]].special = acc[3];
        accounts[acc[0]].user = acc[4];
        accounts[acc[0]].password = acc[5];

        utils.crypto.encrypt(JSON.stringify(accounts), encPwd)
            .then(encryptedAccounts => {
                localStorage.setItem(
                    userId,
                    encryptedAccounts
                );

                initTable();
            });
    }

    function deleteAccount(event) {
        let accounts = event.data.accounts;

        delete accounts[$(this).parents('tr').find('td').first()[0].textContent];

        utils.crypto.encrypt(JSON.stringify(accounts), encPwd)
            .then(encryptedAccounts => {
                localStorage.setItem(
                    userId,
                    encryptedAccounts
                );

                initTable();
            });
    }
}