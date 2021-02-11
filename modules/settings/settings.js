export default async function () {
    'use strict';

    // Init
    await utils.html.append('./modules/settings/settings.html')

    initTable()

    $('#settings').on('hidden.bs.modal', () => $('#settings').remove())
    $('#settings').modal('show')
}

function initTable() {
    $("#accounts tr").remove()

    Object.entries(localStorage).forEach(
        ([key, value]) => {
            $('#accounts').append($('<tr>').append(
                $('<td>').append(key),
                $('<td>').append(JSON.parse(value).version),
                $('<td>').append(JSON.parse(value).len),
                $('<td>').append(JSON.parse(value).special),
                $('<td>').append(JSON.parse(value).user),
                $('<td>').append(JSON.parse(value).password),
                $('<td>').append(
                    $('<button>').addClass('btn fa fa-pen text-white').click(function () {
                        $(this).parents('tr').find('td').each((_key, td) => {
                            if ($(td).html().includes('button')) {
                                $(td).replaceWith($('<td>').append(
                                    $('<button>').addClass('btn fa fa-check text-white').click(function () {
                                        let acc = $(this).parents('tr').find('td').toArray().map(val => val.firstChild.value)
                                        localStorage.setItem(
                                            acc[0],
                                            JSON.stringify({
                                                version: acc[1],
                                                len: acc[2],
                                                special: acc[3],
                                                user: acc[4],
                                                password: acc[5],
                                            })
                                        )
                                        initTable()
                                    }),
                                    $('<button>').addClass('btn fa fa-times text-white').click(initTable)
                                ))
                            }
                            else {
                                $(td).html('<input class="form-control input-sm" value="' + $(td).html() + '">')
                            }
                        });
                    }),
                    $('<button>').addClass('btn fa fa-trash text-white').click(function () {
                        localStorage.removeItem($(this).parents('tr').find('td').first()[0].textContent)
                        initTable()
                    }),
                ),
            ))
        }
    );
}