$(document).ready(function() {
    var fileInput = document.getElementById('document-file');
    var uploadButton = document.getElementById('upload-document-file');

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
    $('#upload-document-button').on('click', function() {
        $('body').addClass('modal-open');
        $('#upload-document-modal').css('display', 'flex');
    });
    // CLOSE MODAL
    $(".close").click(function(e) {
        e.stopPropagation(); // Stop event bubbling up and closing the modal
        $(this).parents(".modal").hide();
        resetForm();
    });

    $('.modal').click(function() {
        $(this).css('display', 'none');
        resetForm();
    });

    function resetForm() {
        $('#submit-document-form')[0].reset();
        $('#document-file-base64').val('');
        $('#upload-document-file').text('Upload Document File');
        $('#upload-document-file').prop('disabled', false);
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

    // Handle document file button click
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
                    document.getElementById('document-file-base64').value = data.fileBase64;
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
    $('#submit-document-form').on('submit', function(e) {
        // Check if a file has been uploaded
        if ($('#document-file')[0].files.length === 0) {
            e.preventDefault();
            showErrorNotificationModal('Please Upload a PDF File');
            return;
        }

        e.preventDefault();
        $('#upload-document-modal').css('display', 'none');
        var formData = new FormData(this);
        var fileBase64 = $('#document-file-base64').val();
        formData.append('fileBase64', fileBase64);

        $.ajax({
                url: '/submit_document',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                dataType: 'json',
            })
            .done(function(response, jqXHR) {
                if (response.status === "success") {
                    console.log("SUCCESS")
                    showSuccessNotification('Document Uploaded Successfully');
                    console.log("Document Uploaded Successfully");
                    window.location.href = response.redirect;
                } else {
                    showErrorNotification('Unexpected status code: ' + jqXHR.status);
                    console.log("Unexpected status code: " + jqXHR.status);
                }
            })
            .fail(function(textStatus, errorThrown) {
                showErrorNotification('Error Uploading Document');
                console.log("Error Uploading Document: ", textStatus, errorThrown);
            });
    });
});