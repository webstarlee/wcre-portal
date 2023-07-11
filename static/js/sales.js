$(document).ready(function() {
    var fileInput = document.getElementById('sale-agreement');
    var uploadButton = document.getElementById('upload-sale-agreement');
    const buyerPhoneInput = document.getElementById('sale-buyer-phone');
    buyerPhoneInput.addEventListener('input', formatBuyerPhoneNumber);
    const sellerPhoneInput = document.getElementById('sale-seller-phone');
    sellerPhoneInput.addEventListener('input', formatSellerPhoneNumber);
    const salePriceInput = document.getElementById('sale-price');
    salePriceInput.addEventListener('input', formatSalePrice);
    const sqFootageInput = document.getElementById('sale-sqft');
    sqFootageInput.addEventListener('input', formatSquareFootage);


    function formatSalePrice() {
        let numericValue = salePriceInput.value.replace(/[^0-9.,]/g, '');
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
        salePriceInput.value = formattedPrice;
    }

    function formatSquareFootage() {
        let numericValue = sqFootageInput.value.replace(/[^0-9.,]/g, '');
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
        const formattedSqft = numberValue ? `${formattedNumber}${cents}` : '';
        sqFootageInput.value = formattedSqft;
    }    

    function formatBuyerPhoneNumber() {
        let phoneNumber = buyerPhoneInput.value.replace(/\D/g, '');
        if (phoneNumber.length > 10) {
            phoneNumber = phoneNumber.substr(0, 10);
        }
        const formattedPhoneNumber = formatToPhoneNumber(phoneNumber);
        buyerPhoneInput.value = formattedPhoneNumber;
    }

    function formatSellerPhoneNumber() {
        let phoneNumber = sellerPhoneInput.value.replace(/\D/g, '');
        if (phoneNumber.length > 10) {
            phoneNumber = phoneNumber.substr(0, 10);
        }
        const formattedPhoneNumber = formatToPhoneNumber(phoneNumber);
        sellerPhoneInput.value = formattedPhoneNumber;
    }

    function formatToPhoneNumber(phoneNumber) {
        const formattedNumber = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        return formattedNumber;
    }

    $(function() {
        $("#sale-end-date").datepicker();
    });

    // RESET FORM DATA
    function resetForm() {
        // Reset all form fields to their initial state
        $('#submit-sale-form')[0].reset();
        $('#sale-agreement-file-base64').val('');
        $('#upload-sale-agreement').text('Upload sale Agreement');
        $('#upload-sale-agreement').prop('disabled', false);
        $('#sale-brokers').removeClass('error');
        $('.error').removeClass('error');
        $('.modal-step').removeClass('active-step');
        $('.modal-step:first').addClass('active-step');
        $('.prev-step').css('visibility', 'hidden');
        $('.next-step').text('Next');
    }

    // OPEN MODAL
    $("#add-sale-button").click(function() {
        $("body").addClass("modal-open");
        $("#add-sale-modal").show();
    });

    // CLOSE MODAL
    $("#add-sale-modal .close").click(function() {
        $("body").removeClass("modal-open");
        $("#add-sale-modal").hide();
    });

    $('.modal').click(function() {
        $(this).css('display', 'none');
        resetForm();
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
        var selectedBrokers = $('#sale-brokers').val();  // use the .val() method instead
        var isValid = selectedBrokers && selectedBrokers.length > 0;
    
        if (!isValid) {
            $('#sale-brokers').addClass('error');
        } else {
            $('#sale-brokers').removeClass('error');
        }
        return isValid;
    }    

    // SEARCH INPUT
    $('#search-input').on('input', function() {
        var searchTerm = $(this).val().toLowerCase();
        $('.centered-table tbody tr').each(function() {
            var sale = $(this).text().toLowerCase();
            $(this).toggle(sale.indexOf(searchTerm) > -1);
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
                    $(this).text('Submit sale');
                } else {
                    $(this).text('Next');
                }
            } else {
                showErrorNotificationModal('Please Fill Out All Required Fields');
            }
        } else {
            if (validateBrokers()) {
                $('#submit-sale-form').submit();
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
                    document.getElementById('sale-agreement-file-base64').value = data.fileBase64;
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
    $(document).ready(function() {
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
    });

    $(document).bind('click', function(e) {
        const actionModal = $('#action-modal');
        if (!$(e.target).closest(actionModal).length) {
            actionModal.hide();
        }
    });

    let sale_id = null;
    $('.centered-table tbody tr').on('contextmenu', function(e) {
        e.preventDefault();
        sale_id = $(this).data('sale-id');
        console.log('sale id:', sale_id);
    });


    $('#delete-button').click(function() {
        console.log(sale_id);
        const selectedRow = $('.centered-table tbody tr[data-sale-id="' + sale_id + '"]');
        const deleteModal = $('#action-modal'); // assuming this is the ID of your deletion modal

        $.ajax({
            url: '/delete_sale/' + sale_id,
            type: 'GET',
            success: function(data) {
                if (data.success) {
                    showErrorNotification('sale Deleted');
                    selectedRow.remove();
                    deleteModal.hide(); // hide the modal
                    console.log('sale Deleted Successfully');
                } else {
                    console.error('Failed to Delete sale: ' + data.message);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Failed to delete sale.');
            }
        });
    });

    // SUBMIT sale
    $('#submit-sale-form').on('submit', function(e) {
        e.preventDefault();
        $('#add-sale-modal').css('display', 'none');

        if (validateStep() && validateBrokers()) {
            var formData = new FormData(this);
            var fileBase64 = $('#sale-agreement-file-base64').val();
            formData.append('fileBase64', fileBase64);

            $.ajax({
                    url: '/submit_sale',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    dataType: 'json',
                })
                .done(function(response, jqXHR) {
                    if (response.status === "success") {
                        showSuccessNotification('Listed Uploaded Successfully');
                        console.log("sale Uploaded Successfully");
                        window.location.href = response.redirect;
                    } else {
                        showErrorNotification('Unexpected status code: ' + jqXHR.status);
                        console.log("Unexpected status code: " + jqXHR.status);
                    }
                })
                .fail(function(textStatus, errorThrown) {
                    showErrorNotification('Error Uploading sale');
                    console.log("Error Uploading sale: ", textStatus, errorThrown);
                });
        }
    });
});