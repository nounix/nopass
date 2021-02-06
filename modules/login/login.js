$(document).ready(function () {
    // Load login view
    fetch("modules/login/login.html").then(c => c.text()).then(c => $("#modules").html(c)).then(() => init());
});

function init() {
    'use strict';

    // Init buttons
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

        import('../main/ipass.js').then(module => {
            module.init(sha3_512(event.data.input.val()));
        });
    }
}