$(document).ready(function() {
    var fileInput = document.getElementById('brochure-file');
    var uploadButton = document.getElementById('upload-brochure-file');

    // SHOW ERROR NOTI
    function showErrorNotification(message) {
        var errorNotification = $('#error-notification');
        errorNotification.text(message);
        errorNotification.addClass('show');

        setTimeout(function() {
            errorNotification.removeClass('show');
        }, 2000);
    }

    function showSuccessNotification(message) {
        var successNotification = $('#success-notification');
        successNotification.text(message);
        successNotification.addClass('show');

        setTimeout(function() {
            successNotification.removeClass('show');
        }, 2000);
    }

    // SHOW SUCCESS NOTI - MODAL
    function showSuccessNotificationModal(message) {
        var successNotification = $('#success-notification-modal');
        successNotification.text(message);
        successNotification.addClass('show');

        setTimeout(function() {
            successNotification.removeClass('show');
        }, 2000);
    }

    // SHOW ERROR NOTI - MODAL
    function showErrorNotificationModal(message) {
        var errorNotification = $('#error-notification-modal');
        errorNotification.text(message);
        errorNotification.addClass('show');

        setTimeout(function() {
            errorNotification.removeClass('show');
        }, 2000);
    }
 
    // OPEN MODAL
    $('#upload-brochure-button').on('click', function() {
       $('body').addClass('modal-open');
       $('#upload-brochure-modal').css('display', 'flex');
    });
    // CLOSE MODAL
    $(".close").click(function(e) {
       e.stopPropagation();  // Stop event bubbling up and closing the modal
       $(this).parents(".modal").hide();
       resetForm();
    });
 
    $('.modal').click(function() {
       $(this).css('display', 'none');
       resetForm();
    });
 
    function resetForm() {
       $('#submit-brochure-form')[0].reset();
       $('#brochure-file-base64').val('');
       $('#upload-brochure-file').text('Upload Brochure File');
       $('#upload-brochure-file').prop('disabled', false);
       $('.error').removeClass('error');
       $('.modal-step').removeClass('active-step');
       $('.modal-step:first').addClass('active-step');
    }
 
    uploadButton.addEventListener('click', function(e) {
       fileInput.click();
    });
 
    $('.modal-content').click(function(event) {
       event.stopPropagation();
    });
 
    // Handle brochure file button click
    fileInput.addEventListener('change', function(e) {
       var file = this.files[0];
       var formData = new FormData();
       formData.append('file', file);
       $.ajax({
             url: '/upload_pdf',
             type: 'POST',
             data: formData,
             processData: false,
             contentType: false,
             success: function(data) {
                if (data.success) {
                   uploadButton.textContent = 'Document Uploaded ✔';
                   showSuccessNotificationModal('Document Uploaded Successfully');
                   uploadButton.disabled = true;
                   document.getElementById('brochure-file-base64').value = data.fileBase64;
                } else {
                   showErrorNotificationModal('Error Uploading Document');
                }
             },
             error: function(xhr, status, error) {
                showErrorNotificationModal('Error Uploading Document');
             }
       });
    });
 
    // Handle Form Submission
    $('#submit-brochure-form').on('submit', function(e) {
        // Check if a file has been uploaded
        if ($('#brochure-file')[0].files.length === 0) {
            e.preventDefault();
            showErrorNotificationModal('Please Upload a PDF File');
            return;
        }
    
        e.preventDefault();
        $('#upload-brochure-modal').css('display', 'none');
        var formData = new FormData(this);
        var fileBase64 = $('#brochure-file-base64').val();
        formData.append('fileBase64', fileBase64);
        
        $.ajax({
            url: '/submit_brochure',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
        })
        .done(function(response, jqXHR){
            if(response.status === "success") {
                console.log("SUCCESS")
                showSuccessNotification('Brochure Uploaded Successfully');
                console.log("Brochure Uploaded Successfully");
                window.location.href = response.redirect;
            } else {
                showErrorNotification('Unexpected status code: ' + jqXHR.status);
                console.log("Unexpected status code: " + jqXHR.status);
            }
        })
        .fail(function(textStatus, errorThrown){
            showErrorNotification('Error Uploading Brochure');
            console.log("Error Uploading Brochure: ", textStatus, errorThrown);
        });   
    });
 });