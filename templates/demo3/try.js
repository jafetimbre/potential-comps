var ShinyPicker = (function () {
    let _isInit = false,
    _comps = {
        modal: null,
        title: {
            inst: null,
            text: [
                "(0)Add or select a picture",
                "(1)Select your picture",
                "(2)Edit your picture"
            ]
        },
        btns: {
            // logout: null
        },
        halt: {
            inst: null,
            waiting: false
        }
    };

    // Pager component for page manipulation
    let _pager = (function () {
        let pagerInit = false,
        currPage = 0,
        prevPage = 0,
        pages = [];

        let comps = {
            backBtn: null,
            logoutCont: null,
            title: null
        };

        return {
            toPage: function (newPage) {
                if (!pagerInit) throw 'ShinyPicker._pager not initialized!';
                comps.title.inst.text(comps.title.text[newPage]);
                
                if (newPage == 0 && currPage != 0) {
                    comps.logoutCont.toggleClass('hidden', true);
                    comps.backBtn.toggleClass('hidden', true);
                    $(pages[0]).css("margin-left", "0%");
                }
                else if (newPage == 1 && currPage != 1) {
                    comps.logoutCont.toggleClass('hidden', false);
                    comps.backBtn.toggleClass('hidden', false);
                    $(pages[1]).toggleClass('hidden', false);
                    $(pages[0]).css("margin-left", "-33.33%");
                }
                else if (newPage == 2 && currPage != 2) {
                    comps.logoutCont.toggleClass('hidden', true);
                    comps.backBtn.toggleClass('hidden', false);
                    if (currPage == 1) {
                        $(pages[1]).toggleClass('hidden', false);
                        $(pages[0]).css("margin-left", "-66.66%");
                    }
                    else {
                        $(pages[1]).toggleClass('hidden', true);
                        $(pages[0]).css("margin-left", "-33.33%");
                    }
                }

                prevPage = currPage;
                currPage = newPage;
            },
            getPage: function (pageNr) { return $(pages[pageNr]); },
            getPageNr: function () { return currPage; },
            getPrevPageNr: function () { return prevPage; },

            init: function (conf) {
                if (pagerInit) throw 'ShinyPicker.pager already initialized!';
                pages = $('.page');
                comps.title = conf.title;
                comps.logoutCont = conf.logoutCont;

                // Back button
                comps.backBtn = $('#page-back-btn');
                comps.backBtn.click(function (e) {
                    if (currPage > 0) {
                        if (prevPage == 0) _pager.toPage(prevPage);
                        else _pager.toPage(currPage - 1);
                    }
                });

                pagerInit = true;
            }
        }
    })();

    // Image editor
    let _editor = (function () {
        let editorInit = false,
        exportOptions = {
            maxSize: 2 * 1048576,    // 2*MB
            uploadlimit: 15 * 1048576,
            compressionAmount: .7,
            imageMaxSize: [ 2048, 2048 ]
        },

        cropper = {
            inst: null,
            isReady: false,
            cropperImg: null
        },
        swiper = {
            inst: null,
            isReady: false
        };

        function changeImage(img) {
            if (!editorInit) throw 'ShinyPicker.cropper not initialized!';
            console.log('cropper image change');
            cropper.inst.replace(img);
        };

        return {
            test: function () {
                // TODO: delete this function
                console.log($(swiper.inst.el).find(`#swiper-img-0`).attr('src', '../../img/chipmonks.jpg'))
            },

            isInit: function () { return editorInit; },

            disable: function () {
                // cropper.inst.disable();
                // swiper.inst.disable();
            },

            crop: function () {
                console.log('Crop');
            },
            
            addImages: function (imgs) {
                swiper.inst.removeAllSlides();

                window.URL = window.URL || window.webkitURL;
                let nonLoadedImgs = imgs.length;
                Array.from(imgs).forEach( (_, i) => {
                    swiper.inst.appendSlide(`<div class="swiper-slide"><img id="swiper-img-${i}" src="" alt=""></div>`);

                    $(swiper.inst.el).find(`#swiper-img-${i}`).one("load", function() {
                        console.log('loaded')

                        if (--nonLoadedImgs == 0) {
                            console.log('All swiper images are loaded');

                            $(cropper.inst.element).one("load", function () {
                                swiper.inst.slideTo(0, 0, false);
                                setTimeout(function() {
                                    _pager.toPage(2);
                                    setTimeout(e => wait(false), 100);
                                }, 100)
                            }).each(function() {
                                if (this.complete) $(this).trigger("load");
                            });
                            changeImage($(swiper.inst.slides[0]).find('img').prop('src'));
                        }
                    }).each(function() {
                        if (this.complete) $(this).trigger("load");
                    });
                });

                // TODO: speed up compression
                Array.from(imgs).forEach( function(img, i) {
                    if (img.size >= exportOptions.maxSize) {
                        console.log(img.size);
                        compress(img, exportOptions.compressionAmount, function(compImg) {
                            let url = URL.createObjectURL(compImg);
                            $(swiper.inst.el).find(`#swiper-img-${i}`).attr('src', url);
                            console.log(compImg.size);
                        });
                    }
                    else {
                        let url = URL.createObjectURL(img);
                        $(swiper.inst.el).find(`#swiper-img-${i}`).attr('src', url);
                    }
                });
            },

            init: function () {
                if (editorInit) throw 'ShinyPicker.cropper already initialized!';

                cropper.cropperImg = $('#editor-image');

                // Init cropper component
                cropper.inst = new Cropper(cropper.cropperImg[0], {
                    aspectRatio: 1 / 1,
                    background: false,
                    autoCropArea: 1,
                    dragMode: "move",
                    viewMode: 1,
                    responsive: true,
                    guides: false,
                    center: false,
                    highlight: false,
                    toggleDragModeOnDblclick: false,

                    ready() {
                        cropper.inst.disable();
                        cropper.isReady = true;
                    }
                });

                // Init swiper component
                swiper.inst = new Swiper("#editor-swiper", {
                    init: true,
                    slidesPerView: "auto",
                    allowTouchMove: true,
                    grabCursor: false,
                    centeredSlides: true,
                    // pagination: {
                    //     el: ".swiper-pagination",
                    //     type: "progressbar",
                    // },
                    spaceBetween: 5,
                    resistanceRatio: .5,
                    navigation: {
                        disabledClass: 'slider-hidden',
                        nextEl: "#swiper-next"
                    },
                    
                    on: {
                        init: function () {
                            console.log('swiper initialized');
                            swiper.isReady = true;
                        },
                        slideChange: function (s) {
                            if (!swiper.isReady) return;
                            console.log('slide change');

                            console.log($(s.slides[s.activeIndex]).find('img'))
                            changeImage($(s.slides[s.activeIndex]).find('img').prop('src'))
                        },
                        reachEnd: function () {
                            if (!swiper.isReady) return;
                            console.log('reach end');
                        },
                    },
                });

                editorInit = true;
            }
        }
    })();

    // Event callbacks
    let callbacks = {
        // Modal events
        afterModalOpen: function (e) {
            console.log('Modal Opened');
            if (!_editor.isInit()) {
                _editor.init();
            }
        },

        // Image source callbacks + logout
        imgSrcDevice:  function (e) {
            wait(true);
            let images = e.currentTarget.files;
            if (images.length <= 0) return;



            // let testImage = images[0];
            // console.log(testImage)
            // compress(testImage, .7, compImg => {
            //     console.log(compImg);
            // });
            // return

            // console.log(images);

            _editor.addImages(images);
            // _pager.toPage(2)
            // TODO: use the uploaded images furher

            e.currentTarget.value = "";
        },
        imgSrcInstagram: function (e) {
            e.preventDefault();
            console.log('Instagram btn clicked')
            _pager.toPage(1);
            // TODO: Instagram things
        },
        socialLogout: function (e) {
            e.preventDefault();

            console.log('Logout clicked');
            _pager.toPage(2);

            // TODO: logout api call
        },

        // Image selector callback
        imageSelector: function (e) {
            switch (_pager.getPageNr()) {
                // TODO: image selector
            }
        }
    }

    // Reset modal state
    function reset() {
        _pager.toPage(0);
    };

    // Spinner trigger function for user wait
    function wait(targetState) {
        if (targetState && !_comps.halt.waiting) {
            console.log('waiting on')
            _comps.halt.inst.toggleClass('hidden',  false);
            _comps.halt.waiting = true;
        } 
        else if (_comps.halt.waiting) {
            console.log('waiting off')
            _comps.halt.inst.toggleClass('hidden',  true);
            _comps.halt.waiting = false;
        }
    }

    // Compress and resize images
    function compress(imgFile, quality, clb) {
        window.URL = window.URL || window.webkitURL;
        let cie = new Image();
        cie.onload = function () {
            console.log('Compression started')
            let cc = document.createElement('canvas');
            cc.width = cie.width;
            cc.height = cie.height;
            let ctx = cc.getContext("2d");
            ctx.drawImage(cie, 0, 0, cie.width, cie.height);
            let durl = cc.toDataURL("image/jpeg", quality);
            
            let mime = durl.split(',')[0].split(':')[1].split(';')[0];
            let binary = atob(durl.split(',')[1]);
            let array = [];
            for (var i = 0; i < binary.length; i++) {
                array.push(binary.charCodeAt(i));
            }
            console.log('Compression finished')
            clb(new Blob([new Uint8Array(array)], {type: mime}));
        };
        cie.src = window.URL.createObjectURL(imgFile);
    }

    return {
        test: function (i) {

            _editor.test();
            // $(_editor.swiper.inst.el).find(`#swiper-img-0`)



            // _comps.modal.trigger('custom.event');

            // _pager.toPage(2);


            // if (_comps.halt.waiting) {
            //     wait(false);
            // }
            // else {
            //     wait(true);
            // }




            // console.log(_pager.getPageNr())
            // _pager.toPage(i);
            // console.log(_pager.getPageNr())
        },

        // Open the picker
        open: function () {
            if (!_isInit) throw 'ShinyPicker not initialized!';

            reset();
            // Opens the modal
            _comps.modal.modal({
                backdrop: 'static',
                keyboard: false,
                focus: true,
                show: true
            });
            
        },

        // Close/hide the picker
        hide: function () {
            _comps.modal.modal('hide');
        },

        // Initialisation function
        init: function () {
            if (_isInit) throw 'ShinyPicker already initialized!';
            console.log('Shiny picker init');

            // Create the modal
            _comps.modal = $('#shiny-modal');
            _comps.title.inst = $('#shiny-modal-title');
            _comps.halt.inst = $('#load-spinner');
            _isInit = true;

            // Init components
            _pager.init({ 
                title: _comps.title,
                logoutCont: $('.shiny-modal-log-out-container')
            });

            // Modal events setup
            _comps.modal.on('shown.bs.modal', callbacks.afterModalOpen);

            // Modal custom events setup
            _comps.modal.on('custom.event', () => {
                console.log('custom event called')
            });

            // Setup modal navigation buttons
            $('#modal-close-btn').click(this.hide);

            // Setup other inputs/btns
            $('#img-input-device').on('change', callbacks.imgSrcDevice);
            $('#imgs-src-btn-instagram').click(callbacks.imgSrcInstagram);
            $('#shiny-modal-log-out').click(callbacks.socialLogout);

            // Image multiple selector callback
            $('.img-selector').on('change', callbacks.imageSelector);

            return this;
        },
    };
})();

$(function () {
    console.log('Jquery loaded');
    console.log(ShinyPicker.init().open());
    // ShinyPicker.test()

    $('#open-modal').click(ShinyPicker.open)
});