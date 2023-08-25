$(document).ready(function() {
    var fileInput = document.getElementById('sale-agreement');
    var uploadButton = document.getElementById('upload-sale-agreement');
    const buyerPhoneInput = document.getElementById('sale-buyer-phone');
    buyerPhoneInput.addEventListener('input', formatBuyerPhoneNumber);
    const sellerPhoneInput = document.getElementById('sale-seller-phone');
    sellerPhoneInput.addEventListener('input', formatSellerPhoneNumber);
    const salePriceInput = document.getElementById('sale-price');
    salePriceInput.addEventListener('input', formatSalePrice);
    const editSalePriceInput = document.getElementById('edit-sale-price');
    editSalePriceInput.addEventListener('input', formatSalePriceEdit);
    const sqFootageInput = document.getElementById('sale-sqft');
    sqFootageInput.addEventListener('input', formatSquareFootage);
    const editsqFootageInput = document.getElementById('edit-sale-sqft');
    editsqFootageInput.addEventListener('input', formatSquareFootageEdit);


    function formatSalePrice() {
        let inputText = salePriceInput.value.trim();
        if (isNaN(inputText.replace(/[,.$]/g, ''))) {
            salePriceInput.value = inputText;
            return;
        }
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

    function formatSalePriceEdit() {
        let inputText = editSalePriceInput.value.trim();
        if (isNaN(inputText.replace(/[,.$]/g, ''))) {
            editSalePriceInput.value = inputText;
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
        editSalePriceInput.value = formattedPrice;
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

    function formatSquareFootageEdit() {
        let numericValue = editsqFootageInput.value.replace(/[^0-9.,]/g, '');
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
        editsqFootageInput.value = formattedSqft;
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

    // OPEN MODAL
    $("#add-sale-button").click(function() {
        $("body").addClass("modal-open");
        $("#edit-sale-modal").hide();
        $("#add-sale-modal").show();
    });

    $(".add-sale-modal").click(function(e) {
		if ($(e.target).hasClass("add-sale-modal") || $(e.target).hasClass("close")) {
			$("body").removeClass("modal-open");
			$("#add-sale-modal").hide();
		}
	});
	$(".edit-sale-modal").click(function(e) {
		if ($(e.target).hasClass("edit-sale-modal") || $(e.target).hasClass("close")) {
			$("body").removeClass("modal-open");
			$("#edit-sale-modal").hide();
		}
	});

    $("#edit-button").click(function () {
        $("body").addClass("modal-open");
        $("#add-sale-modal").hide();
        $("#edit-sale-modal").show();
        const actionModal = $('#action-modal');
        actionModal.hide();
        const selectedRow = $('.centered-table tbody tr[data-sale-id="' + sale_id + '"]');
        const saleAddress = selectedRow.find('td:nth-child(7)').text().trim();
        $('#edit-sale-modal .modal-step-title').text('Edit Sale - ' + saleAddress);
        const saleType = selectedRow.find('td:nth-child(2)').text().trim();
        const saleClosingDate = selectedRow.find('td:nth-child(3)').text().trim();
        const salePrice = selectedRow.find('td:nth-child(4)').text().trim();
        const saleSqFt = selectedRow.find('td:nth-child(5)').text().trim();
        const saleStreet = selectedRow.find('td:nth-child(7)').text().trim();
        const saleCity = selectedRow.find('td:nth-child(8)').text().trim();
        $("#edit-sale-type").val(saleType);
        $("#edit-sale-end-date").val(saleClosingDate);
        $("#edit-sale-price").val(salePrice);
        $("#edit-sale-sqft").val(saleSqFt);
        $("#edit-sale-street").val(saleStreet);
        $("#edit-sale-city").val(saleCity);
    });

    $("#submit-button-edit").click(function() {
        $('#edit-sale-modal').css('display', 'none');
        var saleType = $("#edit-sale-type").val();
        var saleClosingDate = $("#edit-sale-end-date").val();
        var salePrice = $("#edit-sale-price").val();
        var saleSqFt = $("#edit-sale-sqft").val();
        var saleStreet = $("#edit-sale-street").val();
        var saleCity = $("#edit-sale-city").val();

        var data = {
            'sale_type': saleType,
            'sale_end_date': saleClosingDate,
            'sale_price': salePrice,
            'sale_sqft': saleSqFt,
            'sale_street': saleStreet,
            'sale_city': saleCity
        }

        $.ajax({
            url: '/edit_sale/' + sale_id,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(response) {
                if (response.success) {
                    console.log("Sale Edited Successfully");
                    location.reload();
                } else {
                    showErrorNotificationModal('Error Editing Sale');
                    console.log("Error Editing Sale");
                }
            },
            error: function() {
                showErrorNotificationModal('Error Editing Sale');
                console.log("Error Editing Sale");
            }
        });
    });

    function validateStep() {
        var currentStep = $('.active-step.main-form-step');
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

    var currentPage = 1;
	function searchSales(page) {
		var searchTerm = $('#search-input').val().toLowerCase();
		$.ajax({
			url: '/search_sales',
			method: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({
				query: searchTerm,
				page: page
			}),
			success: function(search_results_data) {
				var rows = $.map(search_results_data, function(result) {
                    var $row = $('<tr>').attr('data-sale-id', result._id);
                    $row.append($('<td>').html(result.sale_property_type));
                    $row.append($('<td>').html(result.sale_type));
                    $row.append($('<td>').html(result.sale_end_date));
                    $row.append($('<td>').html(result.sale_price ? result.sale_price : "None"));
                    $row.append($('<td>').text(result.sale_sqft));
                    var price = parseFloat(result.sale_price.replace("$", "").replace(",", ""));
                    var sqft = parseFloat(result.sale_sqft.replace(",", ""));
                    if (!isNaN(price) && !isNaN(sqft) && sqft !== 0) {
                        var pricePerSqft = price / sqft;
                        $row.append($('<td>').text("$" + pricePerSqft.toFixed(2)));
                    } else {
                        $row.append($('<td>').text("N/A"));
                    }
                    $row.append($('<td>').text(result.sale_street));
                    $row.append($('<td>').text(result.sale_city));
                    $row.append($('<td>').html('<a href="mailto:' + result.sale_seller_email + '">' + result.sale_seller + '</a>'));
                    $row.append($('<td>').html('<a href="mailto:' + result.sale_buyer_email + '">' + result.sale_buyer + '</a>'));
                    var brokerElements = $.map(result.brokers, function(broker) {
                        return $('<span>').addClass('broker-name').text(broker);
                    });
                    $row.append($('<td>').append(brokerElements));
                
                    if(result.pdf_file_base64) {
                        $row.append($('<td>').html('<a href="/download_sale_pdf/' + result._id + '">Fully Executed</a>'));
                    } else {
                        $row.append($('<td>').text('Pending'));
                    }
                    return $row;
                });
                
				$('.centered-table tbody').empty().append(rows);
			},
			error: function(textStatus, errorThrown) {
				console.error('Error Fetching Search Results:', textStatus, errorThrown);
				showErrorNotificationModal("Error Fetching Search Results");
			}
		});
	}

    $('#search-input').on('input', function() {
		currentPage = 1; // Reset to the first page on a new search
		searchSales(currentPage);
	});

	$('#next-page').on('click', function() {
		currentPage++;
		searchSales(currentPage);
	});

	$('#prev-page').on('click', function() {
		if (currentPage > 1) {
			currentPage--;
			searchSales(currentPage);
		}
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
        var nextStep = currentStep.next('.modal-step.main-form-step');

        if (nextStep.length) {
            if (validateStep()) {
                currentStep.removeClass('active-step');
                nextStep.addClass('active-step');
                $('.prev-step').css('visibility', 'visible');

                if (!nextStep.next('.modal-step').length) {
                    $(this).text('Submit Sale');
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

    // CLOSE MODAL
    $("#add-sale-modal .close").click(function() {
        $("body").removeClass("modal-open");
        $("#add-sale-modal").hide();
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
        console.log('Sale id:', sale_id);
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
                    showErrorNotification('Sale Deleted');
                    selectedRow.remove();
                    deleteModal.hide(); // hide the modal
                    console.log('Sale Deleted Successfully');
                } else {
                    console.error('Failed to Delete Sale: ' + data.message);
                }
            },
            error: function() {
                console.error('Failed to Delete Sale.');
            }
        });
    });

    // SUBMIT Sale
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
                        showSuccessNotification('Sale Uploaded Successfully');
                        console.log("Sale Uploaded Successfully");
                        window.location.href = response.redirect;
                    } else {
                        showErrorNotification('Unexpected status code: ' + jqXHR.status);
                        console.log("Unexpected status code: " + jqXHR.status);
                    }
                })
                .fail(function(textStatus, errorThrown) {
                    showErrorNotification('Error Uploading Sale');
                    console.log("Error Uploading Sale: ", textStatus, errorThrown);
                });
        }
    });
});