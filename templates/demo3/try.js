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

    // Cropper
    let _cropper = (function () {
        let cropperInit = false,
        cropper = null,
        cropperImg = null;

        return {
            init: function (ops) {
                if (cropperInit) throw 'ShinyPicker.cropper already initialized!';
                cropperImg = ops.crpImg;
                console.log(cropperImg[0]);

                cropper = new Cropper(cropperImg[0], {
                    aspectRatio: 1 / 1,
                    dragMode: "move",
                    viewMode: 1,
                    responsive: true,
                    guides: false,
                    center: false,
                    highlight: false,
                    toggleDragModeOnDblclick: false,
                });
                cropperInit = true;
            }
        }
    })();

    // Event callbacks
    let callbacks = {
        // Modal events
        afterModalOpen: function (e) {
            console.log('Modal Opened');
        },

        // Image source callbacks + logout
        imgSrcDevice: function (e) {
            let images = e.currentTarget.files;
            if (images.length <= 0) return;

            console.log(images);
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

    return {
        test: function (i) {
            console.log(_pager.getPageNr())
            _pager.toPage(i);
            console.log(_pager.getPageNr())
        },

        // Open the picker
        open: function () {
            if (!_isInit) throw 'ShinyPicker not initialized!';

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
            _isInit = true;

            // Init components
            _pager.init({ 
                title: _comps.title,
                logoutCont: $('.shiny-modal-log-out-container')
            });
            _cropper.init({
                crpImg: $('#editor-image')
            });

            // Modal events setup
            _comps.modal.on('shown.bs.modal', callbacks.afterModalOpen);

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
});