$(document).ready(function() {
    const ownerPhoneInput = document.getElementById('listing-owner-phone');
    ownerPhoneInput.addEventListener('input', formatPhoneNumber);

    function formatPhoneNumber() {
        const phoneNumber = ownerPhoneInput.value.replace(/\D/g, '');
        const formattedPhoneNumber = formatToPhoneNumber(phoneNumber);
        ownerPhoneInput.value = formattedPhoneNumber;
    }

    function formatToPhoneNumber(phoneNumber) {
        const formattedNumber = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        return formattedNumber;
    }

    var fileInput = document.getElementById('listing-agreement');
    var uploadButton = document.getElementById('upload-listing-agreement');
    var uploadErrorMessage = document.getElementById('upload-error-message');

    uploadButton.addEventListener('click', function(e) {
        fileInput.click();
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
                    uploadButton.disabled = true;
                    document.getElementById('listing-agreement-file-id').value = data.fileId;
                    uploadErrorMessage.textContent = ''; // Clear any previous error message
                } else {
                    uploadErrorMessage.textContent = 'Error: ' + data.error;
                }
            },
            error: function(xhr, status, error) {
                uploadErrorMessage.textContent = 'Error: ' + error;
            }
        });
    });

    $('#add-listing-button').click(function() {
        $('#add-listing-modal').css('display', 'flex');
    });
    
    $('.close').click(function() {
        $('#add-listing-modal').css('display', 'none');
    });    

    $('.modal').click(function() {
        $(this).css('display', 'none');
    });
    
    $('.modal-content').click(function(event) {
        event.stopPropagation();
    });    

    $('#submit-listing-form').on('submit', function(e) {
        e.preventDefault();
        $('#add-listing-modal').css('display', 'none');
        var formData = new FormData(this);
        var file = $('#listing-agreement')[0].files[0];
        formData.append('file', file);

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
                console.log("Error Uploading Listing");
            }
        });
    });

    $(function() {
        $("#listing-start-date").datepicker();
        $("#listing-end-date").datepicker();
    });

    $('.next-step').on('click', function() {
        var currentStep = $('.active-step');
        var nextStep = currentStep.next('.modal-step');
    
        if (nextStep.length) {
            currentStep.removeClass('active-step');
            nextStep.addClass('active-step');
            $('.prev-step').css('visibility', 'visible'); // Add this line
    
            if (!nextStep.next('.modal-step').length) {
                $(this).text('Submit Listing');
            } else {
                $(this).text('Next');
            }
        } else {
            $('#submit-listing-form').submit();
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
    });

    $('#search-input').on('input', function() {
        var searchTerm = $(this).val().toLowerCase();
        $('.centered-table tbody tr').each(function() {
            var listing = $(this).text().toLowerCase();
            $(this).toggle(listing.indexOf(searchTerm) > -1);
        });
    });
});