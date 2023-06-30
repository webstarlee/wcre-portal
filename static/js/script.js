$(document).ready(function() {
    var fileInput = document.getElementById('listing-agreement');
    var uploadButton = document.getElementById('upload-listing-agreement');
    var uploadErrorMessage = document.getElementById('upload-error-message');
    const ownerPhoneInput = document.getElementById('listing-owner-phone');
    ownerPhoneInput.addEventListener('input', formatPhoneNumber);

    function formatPhoneNumber() {
        let phoneNumber = ownerPhoneInput.value.replace(/\D/g, '');
        if (phoneNumber.length > 10) {
            phoneNumber = phoneNumber.substr(0, 10);
        }
        const formattedPhoneNumber = formatToPhoneNumber(phoneNumber);
        ownerPhoneInput.value = formattedPhoneNumber;
    }

    function formatToPhoneNumber(phoneNumber) {
        const formattedNumber = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        return formattedNumber;
    }

    $(function() {
        $("#listing-start-date").datepicker();
        $("#listing-end-date").datepicker();
    });

    function resetForm() {
        // Reset all form fields to their initial state
        $('#submit-listing-form')[0].reset();
        $('#listing-agreement-file-base64').val('');
        $('#upload-listing-agreement').text('Upload Listing Agreement');
        $('#upload-listing-agreement').prop('disabled', false);
        $('#listing-brokers').removeClass('error');
        $('.error').removeClass('error');
        $('.modal-step').removeClass('active-step');
        $('.modal-step:first').addClass('active-step');
        $('.prev-step').css('visibility', 'hidden');
        $('.next-step').text('Next');
    }

    // Open modal
    $("#add-listing-button").click(function() {
        $("body").addClass("modal-open");
        $("#add-listing-modal").show();
    });
    
    // Close modal
    $("#add-listing-modal .close").click(function() {
        $("body").removeClass("modal-open");
        $("#add-listing-modal").hide();
    });

    $('.modal').click(function() {
        $(this).css('display', 'none');
        resetForm(); // Call the resetForm function when the modal is closed
    });

    function validateStep() {
        var currentStep = $('.active-step');
        var inputs = currentStep.find('input:required, select:required');
        var isValid = true;

        inputs.each(function() {
            if ($(this).val().trim() === '') {
                isValid = false;
                $(this).addClass('error');
            } else {
                $(this).removeClass('error');
            }
        });
        return isValid;
    }

    function validateBrokers() {
        var selectedBrokers = $('input[name="brokers[]"]:checked');
        var isValid = selectedBrokers.length > 0;

        if (!isValid) {
            $('#listing-brokers').addClass('error');
        } else {
            $('#listing-brokers').removeClass('error');
        }

        return isValid;
    }

    $('#search-input').on('input', function() {
        var searchTerm = $(this).val().toLowerCase();
        $('.centered-table tbody tr').each(function() {
            var listing = $(this).text().toLowerCase();
            $(this).toggle(listing.indexOf(searchTerm) > -1);
        });
    });


    uploadButton.addEventListener('click', function(e) {
        fileInput.click();
    });

    $('.modal-content').click(function(event) {
        event.stopPropagation();
    });

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

    $('.next-step').on('click', function() {
        var currentStep = $('.active-step');
        var nextStep = currentStep.next('.modal-step');

        if (nextStep.length) {
            if (validateStep()) {
                currentStep.removeClass('active-step');
                nextStep.addClass('active-step');
                $('.prev-step').css('visibility', 'visible');

                if (!nextStep.next('.modal-step').length) {
                    $(this).text('Submit Listing');
                } else {
                    $(this).text('Next');
                }
            } else {
                showErrorNotification('Please Fill Out All Required Fields');
            }
        } else {
            if (validateBrokers()) {
                $('#submit-listing-form').submit();
            } else {
                showErrorNotification('Please Fill Out All Required Fields');
            }
        }
    });


    $('.prev-step').on('click', function() {
        var currentStep = $('.active-step');
        var prevStep = currentStep.prev('.modal-step');

        if (prevStep.length) {
            currentStep.removeClass('active-step');
            prevStep.addClass('active-step');
            $('.next-step').text('Next');
        }

        if (!prevStep.prev('.modal-step').length) {
            $(this).css('visibility', 'hidden');
        }

        currentStep.find('input:required, select:required').removeClass('error');
    });

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
                    showSuccessNotification('Document Uploaded Successfully');
                    uploadButton.disabled = true;
                    document.getElementById('listing-agreement-file-base64').value = data.fileBase64;
                    uploadErrorMessage.textContent = '';
                } else {
                    showErrorNotification('Error Uploading Document');
                }
            },
            error: function(xhr, status, error) {
                showErrorNotification('Error Uploading Document');
            }
        });
    });

    $('#submit-listing-form').on('submit', function(e) {
        e.preventDefault();
        $('#add-listing-modal').css('display', 'none');

        if (validateStep() && validateBrokers()) {
            var formData = new FormData(this);
            var fileBase64 = $('#listing-agreement-file-base64').val();
            formData.append('fileBase64', fileBase64);

            $.ajax({
                url: '/submit_listing',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    console.log("Listing Uploaded Successfully");
                    window.location.href = '/listings';
                },
                error: function(xhr, status, error) {
                    showErrorNotification('Error Uploading Listing');
                    console.log("Error Uploading Listing");
                }
            });
        }
    });
});