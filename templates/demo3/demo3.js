$( window ).on( "load", function() {
    // $('#shiny-modal').modal('show');
    ShinyPicker.init();
    ShinyPicker.open(document.getElementById('test-img'), 1);
    document.getElementById('open-modal').addEventListener('click', e => {
        ShinyPicker.open(document.getElementById('test-img_1'), 1);
        console.log('asd')
    });
});