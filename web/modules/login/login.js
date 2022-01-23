export default async function () {
    await utils.html.load('./modules/login/login.html');

    $("#master-password").focus();
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
        if (event.key !== 'Enter' && event.type !== 'click') { return; }

        event.preventDefault();

        utils.js.load('../main/main.js', genHashes(event.data.input.val()));
    }

    // https://security.stackexchange.com/questions/3959/recommended-of-iterations-when-using-pkbdf2-sha256
    function genHashes(input) {
        for (let i = 0; i < 2 ** 17; i++) {
            input = sha3_512.digest(input);
        }

        return { masterPwd: sha3_512(input), userId: sha3_512(sha3_512(input)), encPwd: sha3_512(sha3_512(sha3_512(input))) };
    }
}