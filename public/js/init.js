"use strict";

(function($){
    $(function(){

        $('.button-collapse').sideNav();
        
        $(document).ready(function(){

            $('.tooltipped').tooltip({delay: 50});
            // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
            $('.modal-trigger').leanModal({
                    dismissible: true, // Modal can be dismissed by clicking outside of the modal
                    opacity: .5, // Opacity of modal background
                    in_duration: 300, // Transition in duration
                    out_duration: 200, // Transition out duration
                    ready: function() { // Callback for Modal open
                    },
                    complete: function() { // Callback for Modal close
                    }
                }
            );

            function ok (action) {
                Materialize.toast(action + " done", 2500);
            }
            function error (action, err) {
                Materialize.toast(action + " failed", 2500);
                console.log(err);
            }

            $(".audio-control").click(function (event) {
                const elem = $(this)[0];
                console.log(elem);
                const action = elem.href.substring(elem.href.lastIndexOf("#") + 1);

                event.stopPropagation();
                event.cancelBubble = true;

                $.ajax({
                    url: "/control/" + action,  //Server script to process data
                    type: "POST",
                    //Ajax events
                    // beforeSend: beforeSendHandler,
                    success: ok.bind(null, action),
                    error: error.bind(null, action),
                    // Form data
                    data: {},
                    //Options to tell jQuery not to process data or worry about content-type.
                    cache: false
                    // contentType: false,
                    // processData: false
                });
            });

            let statusTime = 1000;
            let interval = null;

            function statusOk (data) {
                const sliderControl = $("#audioTime")[0];
                const textControl = $("#audioTimeText")[0];

                data = JSON.parse(data);

                textControl.value = data.progress + " / " + data.duration;
                //console.log(data);
                if (sliderControl.max != data.duration) {
                    sliderControl.max = data.duration;
                }
                if (sliderControl.value != data.progress) {
                    sliderControl.value = data.progress;
                }
            }

            function statusError (err) {
                Materialize.toast("Status check failed", 2500);
                console.log(err);
                clearInterval(interval);
                statusTime *= 2;
                interval = setInterval(checkStatus, statusTime);
            }

            function checkStatus () {
                $.ajax({
                    url: "/control/status",
                    success: statusOk,
                    error: statusError,
                    //Options to tell jQuery not to process data or worry about content-type.
                    cache: false
                    // contentType: false,
                    // processData: false
                });
            }

            // Interval to check status
            interval = setInterval(checkStatus, statusTime);
        });
    }); // end of document ready
})(jQuery); // end of jQuery name space

function uploadSubmit () {
    const progressHandlingFunction = function (event) {
        console.log("Upload: ", event.loaded, "/", event.total);
        // console.log("progressHandlingFunction", arguments);
    };
    const beforeSendHandler = function (event) {
        // console.log("beforeSendHandler", arguments);
    };
    const completeHandler = function (event) {
        // console.log("completeHandler", arguments);
        Materialize.toast("File upload complete.", 4000);
    };
    const errorHandler = function () {
        // console.log("errorHandler", arguments);
        Materialize.toast("Error uploading file.", 4000);
    };

    const form = $("#file-upload-form");

    var formData = new FormData(form[0]);
    $.ajax({
        url: "/control/upload",  //Server script to process data
        type: "POST",
        xhr: function() {  // Custom XMLHttpRequest
            var myXhr = $.ajaxSettings.xhr();
            if(myXhr.upload){ // Check if upload property exists
                myXhr.upload.addEventListener("progress", progressHandlingFunction, false); // For handling the progress of the upload
            }
            return myXhr;
        },
        //Ajax events
        beforeSend: beforeSendHandler,
        success: completeHandler,
        error: errorHandler,
        // Form data
        data: formData,
        //Options to tell jQuery not to process data or worry about content-type.
        cache: false,
        contentType: false,
        processData: false
    });

    $("#uploadModal").closeModal();
}