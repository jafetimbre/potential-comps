$( window ).on( "load", function() {
    
});

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
    
    init: function () {
        // $(this._modal)
        //     .on('show.bs.modal', e => {
        //         console.log('show')
        //     })
        //     .on('shown.bs.modal', e => {

        //     })
        //     .on('hide.bs.modal', e => {
                
        //     })
        //     .on('hidden.bs.modal', e => {
                
        //     })

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
                // console.log(this._components.progressBar)


                // this.disable(showProgressBar=true);
                // this._components.progressBar.hidden = false;
            
                // let interval = setInterval(() => {
                //     let bar = this._components.progressBar.querySelector('.progress-bar');
                //     let nextValue = parseInt(bar.getAttribute("aria-valuenow")) + 10;

                //     bar.setAttribute("aria-valuenow", nextValue);
                //     bar.style.width = `${nextValue}%`

                //     if (nextValue >= 100) {
                //         clearInterval(interval);
                //         setTimeout(() => {
                //             bar.setAttribute("aria-valuenow", 0);
                //             bar.style.width = `0%`

                //             this.enable([this._components.progressBar]);

                //             let canvas = this._cropper.instance.getCroppedCanvas({
                //                 // width: 160,
                //                 // height: 90,
                //                 // minWidth: 256,
                //                 // minHeight: 256,
                //                 maxWidth: this._exportOptions.imageMaxSize[0],
                //                 maxHeight: this._exportOptions.imageMaxSize[1],
                //                 fillColor: '#fff',
                //                 imageSmoothingEnabled: false,
                //                 imageSmoothingQuality: 'high',
                //             })
            
                //             this.save({
                //                 source: 'picker',
                //                 canvas: canvas
                //             })

                //         }, 1000)
                //     }
                // }, 100)

                // return

                let canvas = this._cropper.instance.getCroppedCanvas({
                    // width: 160,
                    // height: 90,
                    // minWidth: 256,
                    // minHeight: 256,
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

        
        Array.from(document.getElementsByClassName('img-container')).forEach((img) => {
            // img.addEventListener('click', e => {
            //     const image_source = e.currentTarget.querySelector('img');
            //     console.log(image_source)


            //     // this._selectedSource = image_source.dataset.source
            //     // this._selected = image_source;

            //     // switch (image_source.dataset.source) {
            //     //     case 'predefined': {
            //     //         this.save({
            //     //             source: 'predefined',
            //     //             url: image_source.src
            //     //         })
            //     //         break;
            //     //     }
            //     //     case 'instagram': {
            //     //         let url = image_source.src;
            //     //         this._cropper.instance.enable();
            //     //         this._cropper.instance.replace(url)
            //     //         this.currentPage = 3
            //     //         break;
            //     //     }
            //     // }
            // })
        });

        return this
    },

    open: function (expTarget, page=1) {
        this._exportTarget = expTarget;

        this.currentPage = page;
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
                            console.log(blobResized)
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

                let cardindex = this._exportTarget.dataset.position;
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
    }
}

window.addEventListener('DOMContentLoaded', (event) => {

    ShinyPicker.init();
    ShinyPicker.open(document.getElementById('test-img'), 1);
    document.getElementById('open-modal').addEventListener('click', e => {
        ShinyPicker.open(document.getElementById('test-img'), 1);
        console.log('asd')
    });
    // var modalEl = document.getElementById('shiny-modal');
    // var modal = new bootstrap.Modal(modalEl)

    // modal.show();

    // const queryString = window.location.search;
    // const urlParams = new URLSearchParams(queryString);

    // if (ig_after_login != '') {
    //     console.log(ig_after_login)
    //     let attached_image = document.getElementById(`card-image-${ig_after_login}`)
    //     console.log(attached_image)
    //     ShinyPicker.open(attached_image, 2);
    // }

    // if (urlParams.has('picker') && urlParams.has('target')) {
    //     const picker_page = urlParams.get('picker');
    //     const target_card = urlParams.get('target');
    //     console.log(picker_page);
    //     ShinyPicker.open(document.getElementById(`card-image-${target_card}`), picker_page);
    // };

});


