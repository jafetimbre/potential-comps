const ShinyPicker = {
    _curPage: 1,
    _prevPage: 1,
    _modal: document.querySelector("#shiny-modal"),
    _editorImage: document.querySelector("#editor-image"),

    _components: {
        progressBar: document.querySelector("#save-progress-bar"),
        spinner: document.querySelector("#load-spinner")
    },

    _cropper: {
        instance: null,
        isReady: false
    },

    _pageTitles: {
        1: "Add or select a picture",
        2: "Select your picture",
        3: "Edit your picture"
    },

    _selected: null,
    _selectedSource: null,

    _exportTarget: null,
    // _exportPOSTUrl: `${CARD_API_URI}image_upload/`,

    _exportOptions: {
        maxSize: 2 * 1048576,    // 2*MB
        uploadlimit: 20 * 1048576,
        compressionAmount: .7,
        imageMaxSize: [ 2048, 2048 ]
    },

    get currentPage() { return this._curPage },
    get previousPage() { return this._prevPage },

    set currentPage(value) { 
        this._modal.querySelector("#shiny-modal-title").textContent = this._pageTitles[value];
        const pageOne = this._modal.querySelector("#page-1");
        const pageTwo = this._modal.querySelector("#page-2");

        this._modal.querySelector("#page-back-btn").hidden = true;
        if (value == 1) {
            this._modal.querySelector("#page-back-btn").hidden = true;
            this._modal.querySelector("#shiny-modal-log-out").hidden = true;
            this._cropper.instance.disable()
            if (this._curPage != 1) {
                pageOne.style.marginLeft = "0%";
            }
        }
        else {
            this._modal.querySelector("#page-back-btn").hidden = false;

            if (value == 2 && this._curPage != 2) {
                this._modal.querySelector("#shiny-modal-log-out").hidden = false;
                pageTwo.hidden = false;
                pageOne.style.marginLeft = "-33.33%";
                this._cropper.instance.disable()
            }
            else if (value == 3 && this._curPage !== 3) {

                this._modal.querySelector("#shiny-modal-log-out").hidden = true;

                if (this._cropper.instance != null && this._cropper.isReady) {
                    this._cropper.instance.reset();
                }

                if (this._curPage == 2) {
                    pageTwo.hidden = false;  
                    pageOne.style.marginLeft = "-66.66%";
                }
                else {
                    pageTwo.hidden = true;
                    pageOne.style.marginLeft = "-33.33%";
                }
            }
        }
        this._prevPage = this._curPage;
        this._curPage = value;
    },

    init: function() {
        // Isotope layout setup
        var grid = $("#defined-cards-grid").isotope({
            itemSelector: '.element-item'
        })
    
        const cropperImage = document.getElementById('editor-image');
        this._cropper.instance = new Cropper(cropperImage, {
            aspectRatio: 1 / 1,
            dragMode: "move",
            viewMode: 1,
            responsive: true,
            guides: false,
            center: false,
            highlight: false,
            toggleDragModeOnDblclick: false,

            crop(event) {
                // console.log(event.detail.x);
                // console.log(event.detail.y);
                // console.log(event.detail.width);
                // console.log(event.detail.height);
                // console.log(event.detail.rotate);
                // console.log(event.detail.scaleX);
                // console.log(event.detail.scaleY);
            },
            ready() {
                ShinyPicker._cropper.isReady = true;

                setTimeout( () => {
                    ShinyPicker.currentPage = 3;
                    ShinyPicker.enable([ShinyPicker._components.spinner]);
                }, 500)
            }
        });

        // Device upload
        this._modal.querySelector('#img-input-device').addEventListener('change', e => {
            let images = e.currentTarget.files;

            if (images.length <= 0) return;

            for (let i = 0; i < images.length; i++) {
                if (images[i].size >= this._exportOptions.uploadLimit) {
                    alert('Selected image(s) size is to large!');
                    return;
                }
            }
            this._selectedSource = 'device';

            let url = URL.createObjectURL(images[0])

            this.disable([this._components.spinner]);

            this._cropper.instance.enable();
            this._cropper.instance.replace(url);

            e.currentTarget.value = ""
        });

        // Navigation buttons
        this._modal.querySelector('#modal-close-btn').addEventListener('click', () => {
            this.hide();
        });
        this._modal.querySelector('#page-back-btn').addEventListener('click', () => {
            if (this.currentPage > 1)
                if (this.previousPage == 1)
                    this.currentPage = this.previousPage;
                else 
                    this.currentPage -= 1;
        });
        this._modal.querySelector('#imgs-src-btn-instagram').addEventListener('click', e => {
            e.preventDefault();
            if (e.currentTarget.hasAttribute('data-auth')) {
                e.preventDefault();
                this.currentPage = 2;
                return
            }
            else {
                // testing the data pass trough
                let url = `${e.currentTarget.href}`
                window.location.href = `${url}?target=${this._exportTarget.dataset.position}`;
            }
        });

        // Editor controls
        this._modal.querySelector('#editor-zoom-in-btn').addEventListener('click', e => {
            if (this._cropper.instance != null && this._cropper.isReady) {
                this._cropper.instance.zoom(0.1);
            }
        });
        this._modal.querySelector('#editor-zoom-out-btn').addEventListener('click', e => {
            if (this._cropper.instance != null && this._cropper.isReady) {
                this._cropper.instance.zoom(-0.1);
            }
        });
        this._modal.querySelector('#editor-rotate-left-btn').addEventListener('click', e => {
            if (this._cropper.instance != null && this._cropper.isReady) {
                this._cropper.instance.rotate(-90);
            }
        });
        this._modal.querySelector('#editor-rotate-right-btn').addEventListener('click', e => {
            if (this._cropper.instance != null && this._cropper.isReady) {
                this._cropper.instance.rotate(90);
            }
        });
        this._modal.querySelector('#editor-reset-btn').addEventListener('click', e => {
            if (this._cropper.instance != null && this._cropper.isReady) {
                this._cropper.instance.reset();
            }
        });
        this._modal.querySelector('#editor-save-image-btn').addEventListener('click', e => {
            if (this._cropper.instance != null && this._cropper.isReady) {
                let canvas = this._cropper.instance.getCroppedCanvas({
                    maxWidth: this._exportOptions.imageMaxSize[0],
                    maxHeight: this._exportOptions.imageMaxSize[1],
                    fillColor: '#fff',
                    imageSmoothingEnabled: false,
                    imageSmoothingQuality: 'high',
                })
                
                this.save({
                    source: this._selectedSource,
                    canvas: canvas
                })
            }
        });

        Array.from(this._modal.querySelectorAll('.confirm-btn-container button')).forEach( btn => {
            btn.addEventListener('click', e => {
                console.log('Save btn pressed')
                switch (this.currentPage) {
                    case 1: {
                        let checked = this._modal.querySelectorAll('.img-selector:checked + label img[data-source="predefined"]');
                        console.log(checked);
                        break;
                    }
                    case 2: {
                        let checked = this._modal.querySelectorAll('.img-selector:checked + label img[data-source="instagram"]');
                    }
                }
            })
        });
        Array.from(this._modal.getElementsByClassName('img-selector')).forEach( sel => {
            sel.addEventListener('change', e => {
                switch (this.currentPage) {
                    case 1: {
                        // Check if at least 1 predefined image is selected
                        let checked = this._modal.querySelectorAll('.img-selector:checked + label img[data-source="predefined"]');
                        if (checked.length > 0) {
                            this._modal.querySelector('#page-1 .upl-sel-btns-cont').classList.toggle('hidden', true);
                            this._modal.querySelector('#page-1 .confirm-btn-container').classList.toggle('hidden', false);
                            this._modal.querySelector('#page-1 .confirm-btn-container #selected-imgs-counter').textContent = checked.length;
                        }
                        else {
                            this._modal.querySelector('#page-1 .upl-sel-btns-cont').classList.toggle('hidden', false);
                            this._modal.querySelector('#page-1 .confirm-btn-container').classList.toggle('hidden', true);
                        }
                        break;
                    }
                    case 2: {
                        // Check if at least 1 instagram image is selected
                        let checked = this._modal.querySelectorAll('.img-selector:checked + label img[data-source="instagram"]');
                        if (checked.length > 0) {
                            console.log('TODO: show save button')
                        }
                        else {
                            console.log('TODO: hide save button')
                        }
                        break;
                    }
                }
            });
        });

        // API requests
        this._modal.querySelector('#shiny-modal-log-out').addEventListener('click', e => {
            e.preventDefault();
            console.log(e.currentTarget.href)

            $.ajax({
                url: e.currentTarget.href,
                type: 'POST',
                data: { 
                    'targetSocial': 'ig',
                    'target': this._exportTarget.dataset.position
                },
                dataType: 'json',
                success: function (res) {
                    console.log(res);
                    if (res.status == 'success') {
                        let url = `${res.redirect_uri}`;
                        window.location.replace(url)
                    }
                }
            });
        });

        return this
    },

    reset: function () {
        // Reset all img checkers to false
        Array.from(document.querySelectorAll('.img-selector:checked')).forEach( sel => {
            sel.checked = false;
        });
        this._modal.querySelector('#page-1 .upl-sel-btns-cont').classList.toggle('hidden', false);
        this._modal.querySelector('#page-1 .confirm-btn-container').classList.toggle('hidden', true);

    },

    open: function (expTarget, page=1) {
        this._exportTarget = expTarget;

        this.currentPage = page;
        this.reset();
        $(this._modal).modal({backdrop: 'static', keyboard: false})
    },

    hide: function () {
        $(this._modal).modal('hide')
    },

    enable: function (toggleElements=[]) {
        if (toggleElements.length > 0) {
            toggleElements.forEach( el => {
                el.hidden = true;
            });
        }

        this._cropper.instance.enable()
        $(this._modal).find('button').attr('disabled', false);
    },

    disable: function (toggleElements=[]) {
        this._cropper.instance.disable();
        $(this._modal).find('button').attr('disabled', true);

        if (toggleElements.length > 0) {
            toggleElements.forEach( el => {
                el.hidden = false;
            });
        }
    },

    save: function (data) {
        switch (data.source) {
            case 'device':
            case 'instagram': {
                // this._exportTarget.src = data.canvas.toDataURL();
                data.canvas.toBlob(blob => {
                    console.log(blob)

                    let blobToSend = blob;

                    window.URL = window.URL || window.webkitURL;
                    var blobURL = window.URL.createObjectURL(blob);

                    if (blob.size >= this._exportOptions.maxSize) {
                        console.log('Compressing...')
                        let image = new Image();
                        image.src = blobURL;

                        image.onload = function () {
                            let canvas = document.createElement('canvas');
                            canvas.width = image.width;
                            canvas.height = image.height;
                            let ctx = canvas.getContext("2d");
                            ctx.drawImage(image, 0, 0, image.width, image.height);

                            console.log(canvas)
                            console.log(image.width)
                            let dataUri = canvas.toDataURL("image/jpeg", ShinyPicker._exportOptions.compressionAmount);
                            console.log(dataUri)

                            var mime = dataUri.split(',')[0].split(':')[1].split(';')[0];
                            var binary = atob(dataUri.split(',')[1]);
                            var array = [];
                            for (var i = 0; i < binary.length; i++) {
                                array.push(binary.charCodeAt(i));
                            }
                            blobResized =  new Blob([new Uint8Array(array)], {type: mime});
                            blobToSend = blobResized;
                            // console.log(blobResized)
                            // ShinyPicker._exportTarget.src = URL.createObjectURL(blobResized);
                        }
                    }
                    // else {
                    //     this._exportTarget.src = blobURL;
                    // }
                    // TODO: upload

                    let cardindex = this._exportTarget.dataset.position;
                    let formData = new FormData();

                    formData.append('position', cardindex);
                    formData.append('source', data.source)

                    console.log(data.source)

                    formData.append(cardindex, blobToSend, 'image.jpg');
                    $(`#card-spinner-${cardindex}`).toggleClass('hidden', false);

                    $.ajax({
                        url: this._exportPOSTUrl,
                        type: 'POST',
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function (res) {
                            console.log(res);
                            if (res.status == 'success') {
                                let new_url = res.urls[cardindex]
                                ShinyPicker._exportTarget.src = new_url;
                                document.getElementById(`card-image-minimap-${cardindex}`).src = new_url;
                                if (ShinyPicker._exportTarget.hasAttribute('data-default')) 
                                    ShinyPicker._exportTarget.removeAttribute('data-default');
                                setTimeout( () => {
                                    $(`#card-spinner-${cardindex}`).toggleClass('hidden', true);
                                }, 500);
                            }
                        }
                    });

                },'image/jpeg');

                break;
            }
            case 'predefined': {
                // this._exportTarget.src = data.url;
                // TODO: upload

                // TODO: rewrite save function for multiple images

                return 
                let formData = new FormData();

                formData.append('position', cardindex);
                formData.append('source', data.source);
                
                console.log(data.source)

                formData.append('url', data.url)

                $.ajax({
                    url: this._exportPOSTUrl,
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (res) {
                        console.log(res);
                        if (res.status == 'success') {
                            let new_url = res.urls[cardindex];
                            ShinyPicker._exportTarget.src = new_url;
                            document.getElementById(`card-image-minimap-${cardindex}`).src = new_url;
                            if (ShinyPicker._exportTarget.hasAttribute('data-default')) 
                                ShinyPicker._exportTarget.removeAttribute('data-default');
                        }
                    }
                });

                break;
            }
        }
        this.hide();
    },
    
    sendRequest: function (target, data) {
        console.log('Uploading...')
    }
};