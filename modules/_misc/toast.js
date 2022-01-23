export function push(selector, msg, delay) {
    if (!$('#toast-container').length) {
        $(selector).append(`
            <div aria-live="polite" aria-atomic="true">
                <div id="toast-container" style="position: absolute; top: 1rem; right: 1rem;"></div>
            </div>
        `);
    }

    let uid = '_' + Math.random().toString(36).substr(2, 9);

    $("#toast-container").append(`
        <div id="toast-${uid}" class="toast bg-dark text-white" role="alert" aria-live="assertive" aria-atomic="true" data-delay="${delay}">
            <div class="toast-body">${msg}</div>
        </div>
    `);

    $(`#toast-${uid}`).toast('show');

    setTimeout(() => {
        $(`#toast-${uid}`).remove();
        if (!$('.toast').length) { $('#toast-container').parent().remove(); }
    }, delay);
}
