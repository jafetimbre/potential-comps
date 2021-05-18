$( window ).on( "load", function() {
    // $('#shiny-modal').modal('show');
    ShinyPicker.init();

















    
    // ShinyPicker.open(document.getElementById('test-img'), 1);
    document.getElementById('open-modal').addEventListener('click', e => {
        ShinyPicker.open(document.getElementById('test-img_1'), 1);
        console.log('asd')
    });

    // let swiper2 = null;
    // $('#shiny-modal').on('show.bs.modal', e => { 
    //     if (swiper2 != null) {
    //         if (!swiper2.isBeginning) {
    //             swiper2.slideTo(0, 0, false);
    //             document.getElementById('swiper-save').hidden = true;
    //         }
    //     }
    // });
    // $('#shiny-modal').on('shown.bs.modal', e => {
    //     console.log('Modal shown');
    //     if (swiper2 == null) {
    //         swiper2 = new Swiper(".mySwiper2", {
    //             init: false,
    //             slidesPerView: "auto",
    //             allowTouchMove: false,
    //             grabCursor: false,
    //             centeredSlides: true,
    //             pagination: {
    //                 el: ".swiper-pagination",
    //                 type: "progressbar",
    //             },
    //             spaceBetween: 5,
    //             resistanceRatio: .5,
    //             navigation: {
    //                 disabledClass: 'slider-hidden',
    //                 nextEl: "#swiper-next"
    //             },
                
    //         });

    //         swiper2.on('slideChange', e => {
    //             console.log(e.realIndex)
    //             console.log('change slide')
    //             document.getElementById('editor-image').src = $(e.slides[e.realIndex]).find('img').attr('src')
    //         });
    //         swiper2.on('reachEnd', e => {
    //             console.log('slider end')
    //             document.getElementById('swiper-save').hidden = false;
    //         });

    //         swiper2.init();
    //     }
    // });


});

