export default async function () {
    'use strict';

    utils.css.load('./modules/_vendor/css/all.min.css')
    utils.css.load('./modules/_vendor/css/bootstrap.min.css')
    utils.css.load('./modules/_misc/global.css')
    await utils.js.load('../_vendor/scripts/bootstrap.bundle.min.js')
    await utils.js.load('../_vendor/scripts/sha3.min.js')
    await utils.html.load('./modules/login/login.html')

    // Init
    $("#master-password").focus()
    $("#password-state").click({ input: $('#master-password') }, togglePasswordVisibility);
    $("#master-password").keydown({ input: $('#master-password') }, login);
    $("#login").click({ input: $('#master-password') }, login);

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
        if (event.key !== 'Enter' && event.type !== 'click') return

        event.preventDefault()

        utils.js.load('../main/main.js', sha3_512(event.data.input.val()))
    }
}