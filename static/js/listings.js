$(document).ready(function() {
    var fileInput = document.getElementById('listing-agreement');
    var uploadButton = document.getElementById('upload-listing-agreement');
    const ownerPhoneInput = document.getElementById('listing-owner-phone');
    ownerPhoneInput.addEventListener('input', formatPhoneNumber);
    const listingPriceInput = document.getElementById('listing-price');
    listingPriceInput.addEventListener('input', formatListingPrice);
    const editListingPriceInput = document.getElementById('edit-listing-price');
    editListingPriceInput.addEventListener('input', formatListingPriceEdit);

    function formatListingPrice() {
        let inputText = listingPriceInput.value.trim();
        if (isNaN(inputText.replace(/[,.$]/g, ''))) {
            listingPriceInput.value = inputText;
            return;
        }

        let numericValue = inputText.replace(/[^0-9.,]/g, '');
        numericValue = numericValue.replace(/\.+/g, '.').replace(/,+/g, ',');
        const parts = numericValue.split('.');
        if (parts.length > 1) {
            parts[1] = parts[1].substring(0, 2);
            numericValue = parts.join('.');
        }
        let cents = '';
        if (numericValue.includes('.')) {
            [numericValue, cents] = numericValue.split('.');
            cents = '.' + cents;
        }
        numericValue = numericValue.replace(/,/g, '');
        const numberValue = isNaN(parseFloat(numericValue)) ? 0 : parseFloat(numericValue);
        const formattedNumber = new Intl.NumberFormat('en-US').format(numberValue);
        const formattedPrice = numberValue ? `$${formattedNumber}${cents}` : '';
        listingPriceInput.value = formattedPrice;
    }

    function formatListingPriceEdit() {
        let inputText = editListingPriceInput.value.trim();
        if (isNaN(inputText.replace(/[,.$]/g, ''))) {
            editListingPriceInput.value = inputText;
            return;
        }

        let numericValue = inputText.replace(/[^0-9.,]/g, '');
        numericValue = numericValue.replace(/\.+/g, '.').replace(/,+/g, ',');
        const parts = numericValue.split('.');
        if (parts.length > 1) {
            parts[1] = parts[1].substring(0, 2);
            numericValue = parts.join('.');
        }
        let cents = '';
        if (numericValue.includes('.')) {
            [numericValue, cents] = numericValue.split('.');
            cents = '.' + cents;
        }
        numericValue = numericValue.replace(/,/g, '');
        const numberValue = isNaN(parseFloat(numericValue)) ? 0 : parseFloat(numericValue);
        const formattedNumber = new Intl.NumberFormat('en-US').format(numberValue);
        const formattedPrice = numberValue ? `$${formattedNumber}${cents}` : '';
        editListingPriceInput.value = formattedPrice;
    }
    

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


    // RESET FORM DATA
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

    // OPEN MODAL
    $("#add-listing-button").click(function() {
		$("body").addClass("modal-open");
        $("#edit-listing-modal").hide();
		$("#add-listing-modal").show();
	});


    $("#edit-button").click(function () {
        $("body").addClass("modal-open");
        $("#add-listing-modal").hide();
        $("#edit-listing-modal").show();
            
        const actionModal = $('#action-modal');
        actionModal.hide();
        const selectedRow = $('.centered-table tbody tr[data-listing-id="' + listing_id + '"]');
        const listingAddress = selectedRow.find('td:nth-child(6)').text().trim();
        $('#edit-listing-modal .modal-step-title').text('Edit Listing - ' + listingAddress);
        const listingType = selectedRow.find('td:nth-child(2)').text().trim();
        const listingPrice = selectedRow.find('td:nth-child(5)').text().trim();
        $("#edit-listing-type").val(listingType);
        $("#edit-listing-price").val(listingPrice);
    });

    $("#submit-button-edit").click(function() {
        $('#edit-listing-modal').css('display', 'none');
        var listingType = $("#edit-listing-type").val();
        var listingPrice = $("#edit-listing-price").val();
    
        var data = {
            'listing_type': listingType,
            'listing_price': listingPrice,
        }
    
        $.ajax({
            url: '/edit_listing/' + listing_id,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(response) {
                if (response.success) {
                    showSuccessNotification('Listing Edited Successfully');
                    console.log("Listing Edited Successfully");
                    location.reload();
                } else {
                    showErrorNotificationModal('Error Editing listing');
                }
            },
            error: function(xhr, status, error) {
                showErrorNotificationModal('Error Editing listing');
            }
        });
    });
    

    $(".add-listing-modal").click(function(e) {
		if ($(e.target).hasClass("add-listing-modal") || $(e.target).hasClass("close")) {
			$("body").removeClass("modal-open");
			$("#add-listing-modal").hide();
		}
	});
	$(".edit-listing-modal").click(function(e) {
		if ($(e.target).hasClass("edit-listing-modal") || $(e.target).hasClass("close")) {
			$("body").removeClass("modal-open");
			$("#edit-listing-modal").hide();
		}
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
        var selectedBrokers = $('#listing-brokers').val();  // use the .val() method instead
        var isValid = selectedBrokers && selectedBrokers.length > 0;
    
        if (!isValid) {
            $('#listing-brokers').addClass('error');
        } else {
            $('#listing-brokers').removeClass('error');
        }
        return isValid;
    }    

    function validateDates() {
        var startDateInput = $('#listing-start-date');
        var isValid = startDateInput.val().trim().length > 0;
        console.log(isValid)

        if (!isValid) {
            $('#listing-start-date').addClass('error');
        } else {
            $('#listing-start-date').removeClass('error');
        }
        return isValid;
    }

    // SEARCH INPUT
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

    // NEXT STEP
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
                showErrorNotificationModal('Please Fill Out All Required Fields');
            }
        } else {
            if (validateBrokers()) {
                $('#submit-listing-form').submit();
            } else {
                showErrorNotificationModal('Please Fill Out All Required Fields');
            }
        }
    });

    // PREV STEP
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


    // UPLOAD DOCUMENT
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
                    document.getElementById('listing-agreement-file-base64').value = data.fileBase64;
                } else {
                    showErrorNotificationModal('Error Uploading Document');
                }
            },
            error: function(xhr, status, error) {
                showErrorNotificationModal('Error Uploading Document');
            }
        });
    });

    // OPEN ACTION MODAL
    var isAdmin = $('body').data('is-admin') === 'True';
    $('.centered-table tbody tr').on('contextmenu', function(e) {
        if (isAdmin) { // Check if user is an admin
            e.preventDefault();
            const actionModal = $('#action-modal');
            actionModal.css({
                top: e.pageY + 'px',
                left: e.pageX + 'px'
            }).show();
            $(this).focus();
        }
    });

    $(document).bind('click', function(e) {
        const actionModal = $('#action-modal');
        if (!$(e.target).closest(actionModal).length) {
            actionModal.hide();
        }
    });

    let listing_id = null;
    $('.centered-table tbody tr').on('contextmenu', function(e) {
        e.preventDefault();
        listing_id = $(this).data('listing-id');
        console.log('Listing id:', listing_id);
    });


    $('#delete-button').click(function() {
        console.log(listing_id);
        const selectedRow = $('.centered-table tbody tr[data-listing-id="' + listing_id + '"]');
        const deleteModal = $('#action-modal'); // assuming this is the ID of your deletion modal

        $.ajax({
            url: '/delete_listing/' + listing_id,
            type: 'GET',
            success: function(data) {
                if (data.success) {
                    showErrorNotification('Listing Deleted');
                    selectedRow.remove();
                    deleteModal.hide(); // hide the modal
                    console.log('Listing Deleted Successfully');
                } else {
                    console.error('Failed to Delete Listing: ' + data.message);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Failed to delete listing.');
            }
        });
    });

    // SUBMIT LISTING
    $('#submit-listing-form').on('submit', function(e) {
        e.preventDefault();
        $('#add-listing-modal').css('display', 'none');

        if (validateStep() && validateBrokers() && validateDates()) {
            var formData = new FormData(this);
            var fileBase64 = $('#listing-agreement-file-base64').val();
            formData.append('fileBase64', fileBase64);

            $.ajax({
                    url: '/submit_listing',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    dataType: 'json',
                })
                .done(function(response, jqXHR) {
                    if (response.status === "success") {
                        showSuccessNotification('Listing Uploaded Successfully');
                        console.log("Listing Uploaded Successfully");
                        window.location.href = response.redirect;
                    } else {
                        showErrorNotification('Unexpected Status Code: ' + jqXHR.status);
                        console.log("Unexpected Status Code: " + jqXHR.status);
                    }
                })
                .fail(function(textStatus, errorThrown) {
                    showErrorNotification('Error Uploading Listing');
                    console.log("Error Uploading Listing: ", textStatus, errorThrown);
                });
        }
    });
});