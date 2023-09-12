$(document).ready(function() {
	var fileInput = document.getElementById("sale-agreement");
	var uploadButton = document.getElementById("upload-sale-agreement");
	var editFileInput = document.getElementById("edit-sale-agreement");
	var editUploadButton = document.getElementById("edit-upload-sale-agreement");
	const buyerPhoneInput = document.getElementById("sale-buyer-phone");
	const editBuyerPhoneInput = document.getElementById("edit-sale-buyer-phone");
	const sellerPhoneInput = document.getElementById("sale-seller-phone");
	const editSellerPhoneInput = document.getElementById("edit-sale-seller-phone");
	const salePriceInput = document.getElementById("sale-price");
	const editSalePriceInput = document.getElementById("edit-sale-price");
	const commisionPriceInput = document.getElementById("sale-commision");
	const editCommisionPriceInput = document.getElementById("edit-sale-commision");
	const sqFootageInput = document.getElementById("sale-sqft");
	const editsqFootageInput = document.getElementById("edit-sale-sqft");
	buyerPhoneInput.addEventListener("input", () => formatPhoneNumber(buyerPhoneInput));
	editBuyerPhoneInput.addEventListener("input", () => formatPhoneNumber(editBuyerPhoneInput));
	sellerPhoneInput.addEventListener("input", () => formatPhoneNumber(sellerPhoneInput));
	editSellerPhoneInput.addEventListener("input", () => formatPhoneNumber(editSellerPhoneInput));
	salePriceInput.addEventListener("input", () => formatPrice(salePriceInput));
	editSalePriceInput.addEventListener("input", () => formatPrice(editSalePriceInput));
	commisionPriceInput.addEventListener("input", () => formatPrice(commisionPriceInput));
	editCommisionPriceInput.addEventListener("input", () => formatPrice(editCommisionPriceInput));
	sqFootageInput.addEventListener("input", () => formatSqFootage(sqFootageInput));
	editsqFootageInput.addEventListener("input", () => formatSqFootage(editsqFootageInput));

	function toggleErrorClass($element, isError) {
		isError ? $element.addClass("error") : $element.removeClass("error");
	}

	function validateStep() {
		var currentStep = $(".active-step.main-form-step");
		var inputs = currentStep.find("input:required, select:required");
		var isValid = true;
	
		inputs.each(function() {
			var isEmpty = $(this).val().trim() === "";
			toggleErrorClass($(this), isEmpty);
			if (isEmpty) isValid = false;
		});
		return isValid;
	}
	
	function validateBrokers() {
		var $brokerInput = $("#sale-brokers");
		var isValid = $brokerInput.val() && $brokerInput.val().length > 0;
		toggleErrorClass($brokerInput, !isValid);
		return isValid;
	}

	function showNotification(message, elementId) {
		var notification = $("#" + elementId);
		notification.text(message);
		notification.addClass("show");
		setTimeout(function() {
			notification.removeClass("show");
		}, 2000);
	}

	function formatPrice(inputElement) {
		let inputText = inputElement.value.trim();
		if (isNaN(inputText.replace(/[,.$]/g, ""))) {
			inputElement.value = inputText;
			return;
		}

		let numericValue = inputText.replace(/[^0-9.,]/g, "");
		numericValue = numericValue.replace(/\.+/g, ".").replace(/,+/g, ",");
		const parts = numericValue.split(".");
		if (parts.length > 1) {
			parts[1] = parts[1].substring(0, 2);
			numericValue = parts.join(".");
		}

		let cents = "";
		if (numericValue.includes(".")) {
			[numericValue, cents] = numericValue.split(".");
			cents = "." + cents;
		}
		numericValue = numericValue.replace(/,/g, "");
		const numberValue = isNaN(parseFloat(numericValue)) ? 0 : parseFloat(numericValue);
		const formattedNumber = new Intl.NumberFormat("en-US").format(numberValue);
		const formattedPrice = numberValue ? `$${formattedNumber}${cents}` : "";
		inputElement.value = formattedPrice;
	}

	function formatPhoneNumber(inputElement) {
		let phoneNumber = inputElement.value.replace(/\D/g, "");
		if (phoneNumber.length > 10) {
			phoneNumber = phoneNumber.substr(0, 10);
		}
		const formattedPhoneNumber = formatToPhoneNumber(phoneNumber);
		inputElement.value = formattedPhoneNumber;
	}

	function formatToPhoneNumber(phoneNumber) {
		const formattedNumber = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
		return formattedNumber;
	}

	function formatSqFootage(inputElement) {
		let numericValue = inputElement.value.replace(/[^0-9.,]/g, "");
		numericValue = numericValue.replace(/\.+/g, ".").replace(/,+/g, ",");
	
		const parts = numericValue.split(".");
		if (parts.length > 1) {
			parts[1] = parts[1].substring(0, 2);
			numericValue = parts.join(".");
		}
	
		let cents = "";
		if (numericValue.includes(".")) {
			[numericValue, cents] = numericValue.split(".");
			cents = "." + cents;
		}
		numericValue = numericValue.replace(/,/g, "");
		const numberValue = isNaN(parseFloat(numericValue)) ? 0 : parseFloat(numericValue);
		const formattedNumber = new Intl.NumberFormat("en-US").format(numberValue);
		const formattedSqft = numberValue ? `${formattedNumber}${cents} SF` : "";
		inputElement.value = formattedSqft;
	}
	
	$(function() {
		$("#sale-end-date").datepicker();
		$("#edit-sale-end-date").datepicker();
	});

	// OPEN ADD SALES MODAL
	$("#add-sale-button").click(function() {
		resetModalSteps($("#add-sale-modal"));
		$("body").addClass("modal-open");
		$("#edit-sale-modal").hide();
		$("#add-sale-modal").show();
		$("#add-sale-modal .prev-step").addClass("hidden");
	});

	function resetModalSteps(modal) {
		modal.find(".modal-step").removeClass("active-step");
		modal.find(".modal-step:first").addClass("active-step");
		modal.find(".prev-step").addClass("hidden");
		modal.find(".next-step").text("Next");
	}

	$("#edit-button").click(function() {
		const editModal = $("#edit-sale-modal");
		const actionModal = $("#action-modal");
		const selectedRow = $(`.centered-table tbody tr[data-sale-id="${sale_id}"]`);
		const getCellText = (index) => selectedRow.find(`td:nth-child(${index})`).text().trim();
		const getEmailFromCell = (index) => selectedRow.find(`td:nth-child(${index}) a[href^="mailto:"]`).attr("href").replace("mailto:", "").trim();
		const getPhoneFromCell = (index) => selectedRow.find(`td:nth-child(${index}) a[href^="tel:"]`).attr("href").replace("tel:", "").trim();
		const getNameFromCell = (index) => getCellText(index).replace(getEmailFromCell(index), '').replace(getPhoneFromCell(index), '').trim();
		const setInputValue = (selector, value) => $(selector).val(value);
	
		resetModalSteps(editModal);
		$("body").addClass("modal-open");
		$("#add-sale-modal").hide();
		editModal.show();
		editModal.find(".prev-step").addClass("hidden");
		actionModal.hide();
		editModal.find(".modal-step-title").text("Edit Sale - " + getCellText(8));
		setInputValue("#edit-sale-property-type", getCellText(1));
		setInputValue("#edit-sale-type", getCellText(2));
		setInputValue("#edit-sale-end-date", getCellText(3));
		setInputValue("#edit-sale-price", getCellText(4));
		setInputValue("#edit-sale-commision", getCellText(5));
		setInputValue("#edit-sale-sqft", getCellText(6));
		setInputValue("#edit-sale-street", getCellText(8));
		setInputValue("#edit-sale-city", getCellText(9));
		setInputValue("#edit-sale-state", getCellText(10));
		setInputValue("#edit-sale-buyer-name", getNameFromCell(11));
		setInputValue("#edit-sale-buyer-email", getEmailFromCell(11));
		setInputValue("#edit-sale-buyer-phone", getPhoneFromCell(11));
		setInputValue("#edit-sale-seller-name", getNameFromCell(12));
		setInputValue("#edit-sale-seller-email", getEmailFromCell(12));
		setInputValue("#edit-sale-seller-phone", getPhoneFromCell(12));
	});
	
	

	// CLOSE ADD SALE MODAL
	$("#add-sale-modal .close").click(function() {
		$("body").removeClass("modal-open");
		$("#add-sale-modal").hide();
	});

	// CLOSE EDIT SALE MODAL
	$("#edit-sale-modal .close").click(function() {
		$("body").removeClass("modal-open");
		$("#edit-sale-modal").hide();
	});

	let currentPage = 1;
	const searchSales = (page) => {
		const searchTerm = $("#search-input").val().toLowerCase();
		$.ajax({
			url: "/search_sales",
			method: "POST",
			contentType: "application/json",
			data: JSON.stringify({ query: searchTerm, page }),
			success: renderSalesResults,
			error: handleSalesError
		});
	};

	const renderSalesResults = (search_results_data) => {
		const rows = search_results_data.map(result => createRowForSale(result));
		$(".centered-table tbody").empty().append(rows);
	};

	const createRowForSale = (result) => {
		const $row = $("<tr>").attr("data-sale-id", result._id);
		let price = parseFloat(result.sale_price.replace("$", "").replace(",", ""));
		let sqft = parseFloat(result.sale_sqft.replace(",", ""));
		const stateMapping = {
			"New Jersey": "NJ",
			"Pennsylvania": "PA"
		};
		let stateValue = stateMapping[result.sale_state] || result.sale_state;
		const cells = [
			result.sale_property_type,
			result.sale_type,
			result.sale_end_date,
			result.sale_price || "None",
			result.sale_commision || "None",
			result.sale_sqft,
			calculatePricePerSqft(result.sale_price, result.sale_sqft),
			result.sale_street,
			result.sale_city,
			stateValue,
			`<div class="contact-info">
				<a href="mailto:${result.sale_buyer_email}">${result.sale_buyer_name}</a>
				<a href="tel:${result.sale_buyer_phone}">${result.sale_buyer_phone}</a>
			 </div>`,
			 `<div class="contact-info">
				<a href="mailto:${result.sale_seller_email}">${result.sale_seller_name}</a>
				<a href="tel:${result.sale_seller_phone}">${result.sale_seller_phone}</a>
			 </div>`
		];
		cells.forEach(cell => $row.append($("<td>").html(cell)));
		const brokerElements = $.map(result.brokers, broker => $("<span>").addClass("broker-name").text(broker));
		$row.append($("<td>").append(brokerElements));
		$row.append($("<td>").html(result.sale_agreement_file_base64 ? `<a href="/download_sale_pdf/${result._id}">Fully Executed</a>` : "Pending"));
		return $row;
	};

	const calculatePricePerSqft = (price, sqft) => {
		const parsedPrice = parseFloat(price.replace(/\$/g, '').replace(/,/g, ''));
		const parsedSqft = parseFloat(sqft.replace(/,/g, ''));
		if (!isNaN(parsedPrice) && !isNaN(parsedSqft) && parsedSqft !== 0) {
			const rawValue = parsedPrice / parsedSqft;
			return "$" + rawValue.toFixed(2);
		} 
		return "N/A";
	};	
	

	const handleSalesError = (textStatus, errorThrown) => {
		console.error("Error Fetching Search Results:", textStatus, errorThrown);
		showNotification("Error Fetching Search Results", "error-notification-modal");
	};

	$("#search-input").on("input", () => {
		currentPage = 1;
		searchSales(currentPage);
	});

	$("#next-page").on("click", () => {
		currentPage++;
		searchSales(currentPage);
	});

	$("#prev-page").on("click", () => {
		if (currentPage > 1) {
			currentPage--;
			searchSales(currentPage);
		}
	});

	$(".modal-content").click(function(event) {
		event.stopPropagation();
	});

	$(".next-step").on("click", function() {
		var currentModal = $(this).closest(".sale-modal");
		var mode = currentModal.data("mode");
		var currentStep = currentModal.find(".active-step");
		var nextStep = currentStep.next(".modal-step");
		var isValid = (mode === "edit") || validateStep();

		if (isValid) {
			if (nextStep.length) {
				currentStep.removeClass("active-step");
				nextStep.addClass("active-step");
				currentModal.find(".prev-step").removeClass("hidden");

				if (!nextStep.next(".modal-step").length) {
					if (mode === "add") {
						$(this).text("Submit Sale");
					} else {
						$(this).text("Submit Sale Edits");
					}
				} else {
					$(this).text("Next");
				}
			} else {
				if (mode === "add" && validateBrokers()) {
					$("#submit-sale-form").submit();
				} else if (mode === "edit" && $(this).text() === "Submit Sale Edits") {
					$("#edit-sale-modal").css("display", "none");
					var saleType = $("#edit-sale-type").val();
					var salePropertyType = $("#edit-sale-property-type").val();
					var saleClosingDate = $("#edit-sale-end-date").val();
					var salePrice = $("#edit-sale-price").val();
					var saleCommision = $("#edit-sale-commision").val();
					var saleSqFt = $("#edit-sale-sqft").val();
					var saleStreet = $("#edit-sale-street").val();
					var saleCity = $("#edit-sale-city").val();
					var saleState = $("#edit-sale-state").val();
					var saleBuyer = $("#edit-sale-buyer-name").val();
					var saleBuyerEmail = $("#edit-sale-buyer-email").val();
					var saleBuyerPhone = $("#edit-sale-seller-phone").val();
					var saleSeller = $("#edit-sale-seller-name").val();
					var saleSellerEmail = $("#edit-sale-seller-email").val();
					var saleSellerPhone = $("#edit-sale-seller-phone").val();
					var fileBase64 = $("#edit-sale-agreement-file-base64").val();

					var data = {
						sale_type: saleType,
						sale_property_type: salePropertyType,
						sale_end_date: saleClosingDate,
						sale_agreement_file_base64: fileBase64,
						sale_price: salePrice,
						sale_commision: saleCommision,
						sale_sqft: saleSqFt,
						sale_street: saleStreet,
						sale_city: saleCity,
						sale_state: saleState,
						sale_buyer_name: saleBuyer,
						sale_buyer_email: saleBuyerEmail,
						sale_buyer_phone: saleBuyerPhone,
						sale_seller_name: saleSeller,
						sale_seller_email: saleSellerEmail,
						sale_seller_phone: saleSellerPhone
					};

					$.ajax({
						url: "/edit_sale/" + sale_id,
						type: "POST",
						contentType: "application/json",
						data: JSON.stringify(data),
						success: function(response) {
							if (response.success) {
								location.reload();
							} else {
								showNotification("Error Editing Sale", "error-notification-modal");
							}
						},
						error: function() {
							showErrorNotificationModal("Error Editing Sale");
						},
					});
				} else {
					showNotification("Please Fill Out All Required Fields", "error-notification-modal");
				}
			}
		} else {
			showNotification("Please Fill Out All Required Fields", "error-notification-modal");
		}
	});

	$(".prev-step").on("click", function() {
		var currentModal = $(this).closest(".sale-modal");
		var currentStep = currentModal.find(".active-step");
		var prevStep = currentStep.prev(".modal-step");
		var nextButton = currentModal.find(".next-step");
	
		if (prevStep.length) {
			currentStep.removeClass("active-step");
			prevStep.addClass("active-step");
	
			if (!prevStep.next(".modal-step").length) {
				if (currentModal.data("mode") === "add") {
					nextButton.text("Submit Sale");
				} else {
					nextButton.text("Submit Sale Edits");
				}
			} else {
				nextButton.text("Next");
			}
	
			if (currentModal.data("mode") === "add") {
				currentStep.find("input:required, select:required").removeClass("error");
			}
		}
	});

	function handleFileUpload(config) {
		config.inputElement.addEventListener("change", function(e) {
			var file = this.files[0];
			var formData = new FormData();
			formData.append("file", file);
	
			$.ajax({
				url: "/upload_pdf",
				type: "POST",
				data: formData,
				processData: false,
				contentType: false,
				success: function(data) {
					if (data.success) {
						config.buttonElement.textContent = "Document Uploaded ✔";
						config.buttonElement.disabled = true;
						document.getElementById(config.resultElementId).value = data.fileBase64;
					} else {
						showNotification("Error Uploading Document", "error-notification-modal");
					}
				},
				error: function() {
					showNotification("Error Uploading Document", "error-notification-modal");
				}
			});
		});
		config.buttonElement.addEventListener("click", function(e) {
			config.inputElement.click();
		});
	}
	
	var configurations = [
		{
			inputElement: fileInput,
			buttonElement: uploadButton,
			resultElementId: "sale-agreement-file-base64"
		},
		{
			inputElement: editFileInput,
			buttonElement: editUploadButton,
			resultElementId: "edit-sale-agreement-file-base64"
		}
	];
	
	configurations.forEach(function(config) {
		handleFileUpload(config);
	});
	

	// OPEN ACTION MODAL
	$(document).ready(function() {
		var isAdmin = $("body").data("is-admin") === "True";
		$(".centered-table tbody tr").on("contextmenu", function(e) {
			if (isAdmin) {
				e.preventDefault();
				const actionModal = $("#action-modal");
				actionModal
					.css({
						top: e.pageY + "px",
						left: e.pageX + "px",
					})
					.show();
				$(this).focus();
			}
		});
	});


	$(document).bind("click", function(e) {
		const actionModal = $("#action-modal");
		if (!$(e.target).closest(actionModal).length) {
			actionModal.hide();
		}
	});

	let sale_id = null;
	$(".centered-table tbody tr").on("contextmenu", function(e) {
		e.preventDefault();
		sale_id = $(this).data("sale-id");
		console.log("Sale id:", sale_id);
	});

	$("#delete-button").click(function() {
		console.log(sale_id);
		const selectedRow = $(
			'.centered-table tbody tr[data-sale-id="' + sale_id + '"]'
		);
		const deleteModal = $("#action-modal"); // assuming this is the ID of your deletion modal
		$.ajax({
			url: "/delete_sale/" + sale_id,
			type: "GET",
			success: function(data) {
				if (data.success) {
					showNotification("Sale Deleted", "error-notification");
					selectedRow.remove();
					deleteModal.hide();
					$.get("/count/sales", function(response) {
						$("#sales-count").html("Total Sales: " + response.count);
					});
				} else {
					showNotification("Failed to Delete Sale", "error-notification");
				}
			},
			error: function() {
				showNotification("Failed to Delete Sale", "error-notification");
			},
		});
	});

	// SUBMIT Sale
	$("#submit-sale-form").on("submit", function(e) {
		e.preventDefault();
		$("#add-sale-modal").css("display", "none");

		if (validateStep() && validateBrokers()) {
			var formData = new FormData(this);
			var fileBase64 = $("#sale-agreement-file-base64").val();
			formData.append("fileBase64", fileBase64);

			$.ajax({
					url: "/submit_sale",
					type: "POST",
					data: formData,
					processData: false,
					contentType: false,
					dataType: "json",
				})
				.done(function(response, jqXHR) {
					if (response.status === "success") {
						window.location.href = response.redirect;
					} else {
						showNotification("Unexpected status code: " + jqXHR.status, "error-notification");
						console.log("Unexpected status code: " + jqXHR.status);
					}
				})
				.fail(function(textStatus, errorThrown) {
					showNotification("Error Uploading Sale", "error-notification");
					console.log("Error Uploading Sale: ", textStatus, errorThrown);
				});
		}
	});
});