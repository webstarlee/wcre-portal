$(document).ready(function () {
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
	const commissionPriceInput = document.getElementById("sale-commission");
	const editcommissionPriceInput = document.getElementById("edit-sale-commission");
	const sqFootageInput = document.getElementById("sale-sqft");
	const editsqFootageInput = document.getElementById("edit-sale-sqft");
	buyerPhoneInput.addEventListener("input", () => formatPhoneNumber(buyerPhoneInput));
	editBuyerPhoneInput.addEventListener("input", () => formatPhoneNumber(editBuyerPhoneInput));
	sellerPhoneInput.addEventListener("input", () => formatPhoneNumber(sellerPhoneInput));
	editSellerPhoneInput.addEventListener("input", () => formatPhoneNumber(editSellerPhoneInput));
	salePriceInput.addEventListener("input", () => formatPrice(salePriceInput));
	editSalePriceInput.addEventListener("input", () => formatPrice(editSalePriceInput));
	commissionPriceInput.addEventListener("input", () => formatPrice(commissionPriceInput));
	editcommissionPriceInput.addEventListener("input", () => formatPrice(editcommissionPriceInput));
	sqFootageInput.addEventListener("input", () => formatSqFootage(sqFootageInput));
	editsqFootageInput.addEventListener("input", () => formatSqFootage(editsqFootageInput));
	$(document).on("input", "#search-input", () => updateSearchSales("input"));
	$(document).on("click", "#next-page", () => updateSearchSales("next"));
	$(document).on("click", "#prev-page", () => updateSearchSales("prev"));

	function toggleErrorClass($element, isError) {
		isError ? $element.addClass("error") : $element.removeClass("error");
	}

	function validateStep() {
		var currentStep = $(".active-step.main-form-step");
		var inputs = currentStep.find("input:required, select:required");
		var isValid = true;

		inputs.each(function () {
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
		setTimeout(function () {
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

	const calculatePricePerSqft = (price, sqft) => {
		const parsedPrice = parseFloat(price.replace(/\$/g, '').replace(/,/g, ''));
		const parsedSqft = parseFloat(sqft.replace(/,/g, ''));
		if (!isNaN(parsedPrice) && !isNaN(parsedSqft) && parsedSqft !== 0) {
			const rawValue = parsedPrice / parsedSqft;
			return "$" + rawValue.toFixed(2);
		}
		return "N/A";
	};

	$(function () {
		$("#sale-end-date").datepicker();
		$("#edit-sale-end-date").datepicker();
	});
	$("#add-sale-button").click(function () {
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

	$("#edit-button").click(function () {
		const editModal = $("#edit-sale-modal");
		const actionModal = $("#action-modal");
		const selectedRow = $(`.centered-table tbody tr[data-sale-id="${sale_id}"]`);
		const getCellText = (index) => selectedRow.find(`td:nth-child(${index})`).text().trim();
		const getEmailFromCell = (index) => selectedRow.find(`td:nth-child(${index}) a[href^="mailto:"]`).attr("href").replace("mailto:", "").trim();
		const getPhoneFromCell = (index) => selectedRow.find(`td:nth-child(${index}) a[href^="tel:"]`).attr("href").replace("tel:", "").trim();
		const getNameFromCell = (index) => selectedRow.find(`td:nth-child(${index}) a[href^="mailto:"]`).text().trim();
		const getBuyerEntityFromCell = (index) => selectedRow.find(`td:nth-child(${index}) .buyer-entity`).text().trim();
		const getSellerEntityFromCell = (index) => selectedRow.find(`td:nth-child(${index}) .seller-entity`).text().trim();
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
		setInputValue("#edit-sale-commission", getCellText(5));
		setInputValue("#edit-sale-sqft", getCellText(6));
		setInputValue("#edit-sale-street", getCellText(8));
		setInputValue("#edit-sale-city", getCellText(9));
		setInputValue("#edit-sale-state", getCellText(10));
		setInputValue("#edit-sale-buyer-entity", getBuyerEntityFromCell(11));
		setInputValue("#edit-sale-buyer-name", getNameFromCell(11));
		setInputValue("#edit-sale-buyer-email", getEmailFromCell(11));
		setInputValue("#edit-sale-buyer-phone", getPhoneFromCell(11));
		setInputValue("#edit-sale-seller-entity", getSellerEntityFromCell(12));
		setInputValue("#edit-sale-seller-name", getNameFromCell(12));
		setInputValue("#edit-sale-seller-email", getEmailFromCell(12));
		setInputValue("#edit-sale-seller-phone", getPhoneFromCell(12));
		const notesContent = getCellText(15);
		if (notesContent && notesContent !== "No Notes") {
			setInputValue("#edit-notes-option", "enter-notes");
			$("#edit-sale-notes").show().val(notesContent);
		} else {
			setInputValue("#edit-notes-option", "no-notes");
			$("#edit-sale-notes").hide().val('');
		}
	});

	window.toggleNotesField = function (dropdownId, textareaId) {
		var notesOption = document.getElementById(dropdownId).value;
		var notesField = document.getElementById(textareaId);
		if (notesOption === 'enter-notes') {
			notesField.style.display = 'block';
		} else {
			notesField.style.display = 'none';
			notesField.value = 'No Notes';
		}
	};


	$(".sale-modal .close").click(function () {
		$("body").removeClass("modal-open");
		$(this).closest(".sale-modal").hide();
	});

	let currentPage = 1;
	const searchSales = (page) => {
		const searchTerm = $("#search-input").val().toLowerCase();
		$.ajax({
			url: "/search_sales",
			method: "POST",
			contentType: "application/json",
			data: JSON.stringify({
				query: searchTerm,
				page
			}),
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
			result.sale_commission || "None",
			result.sale_sqft,
			calculatePricePerSqft(result.sale_price, result.sale_sqft),
			result.sale_street,
			result.sale_city,
			stateValue,
			`<div class="contact-info">
				<div class="buyer-entity">${result.sale_buyer_entity}</div>
				<a href="mailto:${result.sale_buyer_email}">${result.sale_buyer_name}</a>
				<a href="tel:${result.sale_buyer_phone}">${result.sale_buyer_phone}</a>
			 </div>`,
			`<div class="contact-info">
				<div class="seller-entity">${result.sale_seller_entity}</div>
				<a href="mailto:${result.sale_seller_email}">${result.sale_seller_name}</a>
				<a href="tel:${result.sale_seller_phone}">${result.sale_seller_phone}</a>
			 </div>`
		];
		cells.forEach(cell => $row.append($("<td>").html(cell)));
		const brokerElements = $.map(result.brokers, broker => $("<span>").addClass("broker-name").text(broker));
		$row.append($("<td>").append(brokerElements));
		$row.append($("<td>").html(result.sale_agreement_file_id ? `<a href="/download/${result.sale_agreement_file_id}">Fully Executed</a>` : "Pending"));
		$row.append($("<td>").text(result.sale_notes));
		return $row;
	};


	const handleSalesError = (textStatus, errorThrown) => {
		console.error("Error Fetching Search Results:", textStatus, errorThrown);
		showNotification("Error Fetching Search Results", "error-notification");
	};

	const updateSearchSales = (action) => {
		if (action === "next") {
			currentPage++;
		} else if (action === "prev" && currentPage > 1) {
			currentPage--;
		} else if (action === "input") {
			currentPage = 1;
		}
		searchSales(currentPage);
	};

	$(".modal-content").click(function (event) {
		event.stopPropagation();
	});

	function updateUIBasedOnStep(currentStep, currentModal) {
		if (currentStep.is(":first-child")) {
			currentModal.find(".prev-step").addClass("hidden");
		} else {
			currentModal.find(".prev-step").removeClass("hidden");
		}
		var nextButton = currentModal.find(".next-step");
		if (!currentStep.next(".modal-step").length) {
			if (currentModal.data("mode") === "add") {
				nextButton.text("Submit Sale");
			} else {
				nextButton.text("Submit Sale Edits");
			}
		} else {
			nextButton.text("Next");
		}
	}

	$(".next-step").on("click", function () {
		var currentModal = $(this).closest(".sale-modal");
		var mode = currentModal.data("mode");
		var currentStep = currentModal.find(".active-step");
		var nextStep = currentStep.next(".modal-step");
		var isValid = (mode === "edit") || validateStep();

		if (isValid) {
			if (nextStep.length) {
				currentStep.removeClass("active-step");
				nextStep.addClass("active-step");
				updateUIBasedOnStep(nextStep, currentModal);
			} else {
				if (mode === "add") {
					$("#submit-sale-form").submit();
				} else if (mode === "edit" && $(this).text() === "Submit Sale Edits") {
					$("#edit-sale-modal").css("display", "none");
					var data = {
						sale_type: $("#edit-sale-type").val(),
						sale_property_type: $("#edit-sale-property-type").val(),
						sale_end_date: $("#edit-sale-end-date").val(),
						sale_agreement_file_id: $("#edit-sale-agreement-file-id").val(),
						sale_price: $("#edit-sale-price").val(),
						sale_commission: $("#edit-sale-commission").val(),
						sale_sqft: $("#edit-sale-sqft").val(),
						sale_street: $("#edit-sale-street").val(),
						sale_city: $("#edit-sale-city").val(),
						sale_state: $("#edit-sale-state").val(),
						sale_buyer_entity: $("#edit-sale-buyer-entity").val(),
						sale_buyer_name: $("#edit-sale-buyer-name").val(),
						sale_buyer_email: $("#edit-sale-buyer-email").val(),
						sale_buyer_phone: $("#edit-sale-seller-phone").val(),
						sale_seller_entity: $("#edit-sale-seller-entity").val(),
						sale_seller_name: $("#edit-sale-seller-name").val(),
						sale_seller_email: $("#edit-sale-seller-email").val(),
						sale_seller_phone: $("#edit-sale-seller-phone").val(),
						sale_notes: $("#edit-sale-notes").val()
					};
					$.ajax({
						url: "/edit_sale/" + sale_id,
						type: "POST",
						contentType: "application/json",
						data: JSON.stringify(data),
						success: function (response) {
							if (response.success) {
								location.reload();
							} else {
								showNotification("Error Editing Sale", "error-notification");
							}
						},
						error: function () {
							showErrorNotificationModal("Error Editing Sale");
						},
					});
				} else {
					showNotification("Please Fill Out All Required Fields", "error-notification");
				}
			}
		} else {
			showNotification("Please Fill Out All Required Fields", "error-notification");
		}
	});

	$(".prev-step").on("click", function () {
		var currentModal = $(this).closest(".sale-modal");
		var currentStep = currentModal.find(".active-step");
		var prevStep = currentStep.prev(".modal-step");
		if (prevStep.length) {
			currentStep.removeClass("active-step");
			prevStep.addClass("active-step");
			updateUIBasedOnStep(prevStep, currentModal);
			if (currentModal.data("mode") === "add") {
				currentStep.find("input:required, select:required").removeClass("error");
			}
		}
	});

	function handleFileUpload(config) {
		config.inputElement.addEventListener("change", function (e) {
			var file = this.files[0];
			var formData = new FormData();
			formData.append("file", file);
			config.buttonElement.textContent = "Uploading Document...";
			config.buttonElement.disabled = true;
			$.ajax({
				url: "/upload_pdf",
				type: "POST",
				data: formData,
				processData: false,
				contentType: false,
				success: function (data) {
					if (data.success) {
						config.buttonElement.textContent = "Document Uploaded ✔ " + "(" + file.name + ")";
						document.getElementById(config.resultElementId).value = data["file_id"];
						config.buttonElement.disabled = false;
					} else {
						showNotification("Error Uploading Document", "error-notification");
					}
				},
				error: function () {
					showNotification("Error Uploading Document", "error-notification");
				}
			});
		});
		config.buttonElement.addEventListener("click", function (e) {
			config.inputElement.click();
		});
	}

	var configurations = [{
		inputElement: fileInput,
		buttonElement: uploadButton,
		resultElementId: "sale-agreement-file-id"
	},
	{
		inputElement: editFileInput,
		buttonElement: editUploadButton,
		resultElementId: "edit-sale-agreement-file-id"
	}
	];

	configurations.forEach(function (config) {
		handleFileUpload(config);
	});


	let sale_id = null;
	var isAdmin = $("body").data("is-admin") === "True";
	$(".centered-table tbody").on("contextmenu", "tr", function (e) {
		e.preventDefault();
		if (isAdmin) {
			const actionModal = $("#action-modal");
			actionModal
				.css({
					top: e.pageY + "px",
					left: e.pageX + "px",
				})
				.show();
			$(this).focus();
		}
		sale_id = $(this).data("sale-id");
		console.log("Sale ID:", sale_id);
	});


	$(document).bind("click", function (e) {
		const actionModal = $("#action-modal");
		if (!$(e.target).closest(actionModal).length) {
			actionModal.hide();
		}
	});

	$("#delete-button").click(function () {
		const selectedRow = $(
			'.centered-table tbody tr[data-sale-id="' + sale_id + '"]'
		);
		const deleteModal = $("#action-modal");
		$.ajax({
			url: "/delete_sale/" + sale_id,
			type: "GET",
			success: function (response) {
				if (response.success) {
					showNotification("Sale Deleted", "error-notification");
					selectedRow.remove();
					deleteModal.hide();
					$.get("/count/sales", function (response) {
						$("#sales-count").html("Total Sales: " + response.count);
					});
				} else {
					showNotification("Failed to Delete Sale", "error-notification");
				}
			},
			error: function () {
				showNotification("Failed to Delete Sale", "error-notification");
			},
		});
	});
	$("#submit-sale-form").on("submit", function (e) {
		e.preventDefault();
		if (validateStep() && validateBrokers()) {
			$("#add-sale-modal").css("display", "none");
			var formData = new FormData(this);
			formData.append("sale-agreement-file-id", $("#sale-agreement-file-id").val());
			$.ajax({
				url: "/submit_sale",
				type: "POST",
				data: formData,
				processData: false,
				contentType: false,
				dataType: "json",
			})
				.done(function (response) {
					if (response.success) {
						window.location.href = response.redirect;
					} else {
						showNotification("Error Uploading Sale", "error-notification")
					}
				})
				.fail(function () {
					showNotification("Error Uploading Sale", "error-notification");
				});
		}
		else {
			showNotification("Please Fill Out All Required Fields", "error-notification");
		}
	});
});