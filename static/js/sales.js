$(document).ready(function() {
	var fileInput = document.getElementById("sale-agreement");
	var uploadButton = document.getElementById("upload-sale-agreement");
	const buyerPhoneInput = document.getElementById("sale-buyer-phone");
	const editBuyerPhoneInput = document.getElementById("edit-sale-buyer-phone");
	const sellerPhoneInput = document.getElementById("sale-seller-phone");
	const editSellerPhoneInput = document.getElementById("edit-sale-seller-phone");
	const salePriceInput = document.getElementById("sale-price");
	const editSalePriceInput = document.getElementById("edit-sale-price");
	const sqFootageInput = document.getElementById("sale-sqft");
	const editsqFootageInput = document.getElementById("edit-sale-sqft");
	buyerPhoneInput.addEventListener("input", () => formatPhoneNumber(buyerPhoneInput));
	editBuyerPhoneInput.addEventListener("input", () => formatPhoneNumber(editBuyerPhoneInput));
	sellerPhoneInput.addEventListener("input", () => formatPhoneNumber(sellerPhoneInput));
	editSellerPhoneInput.addEventListener("input", () => formatPhoneNumber(editSellerPhoneInput));
	salePriceInput.addEventListener("input", () => formatPrice(salePriceInput));
	editSalePriceInput.addEventListener("input", () => formatPrice(editSalePriceInput));
	sqFootageInput.addEventListener("input", () => formatSqFootage(sqFootageInput));
	editsqFootageInput.addEventListener("input", () => formatSqFootage(editsqFootageInput));


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
		const formattedSqft = numberValue ? `${formattedNumber}${cents}` : "";
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
		resetModalSteps($("#edit-sale-modal"));
		$("body").addClass("modal-open");
		$("#add-sale-modal").hide();
		$("#edit-sale-modal").show();
		$("#edit-sale-modal .prev-step").addClass("hidden");
		const actionModal = $("#action-modal");
		actionModal.hide();
		const selectedRow = $(
			'.centered-table tbody tr[data-sale-id="' + sale_id + '"]'
		);
		const saleAddress = selectedRow.find("td:nth-child(7)").text().trim();
		$("#edit-sale-modal .modal-step-title").text("Edit Sale - " + saleAddress);
		const saleType = selectedRow.find("td:nth-child(2)").text().trim();
		const saleClosingDate = selectedRow.find("td:nth-child(3)").text().trim();
		const salePrice = selectedRow.find("td:nth-child(4)").text().trim();
		const saleSqFt = selectedRow.find("td:nth-child(5)").text().trim();
		const saleStreet = selectedRow.find("td:nth-child(7)").text().trim();
		const saleCity = selectedRow.find("td:nth-child(8)").text().trim();
		const saleBuyer = selectedRow.find("td:nth-child(9)").text().trim();
		const saleBuyerEmail = selectedRow
			.find("td:nth-child(9) a")
			.attr("href")
			.replace("mailto:", "")
			.trim();
		const saleBuyerPhone = selectedRow.find("td:nth-child(10)").text().trim();
		const saleSeller = selectedRow.find("td:nth-child(11)").text().trim();
		const saleSellerEmail = selectedRow
			.find("td:nth-child(11) a")
			.attr("href")
			.replace("mailto:", "")
			.trim();
		const saleSellerPhone = selectedRow.find("td:nth-child(12)").text().trim();
		$("#edit-sale-type").val(saleType);
		$("#edit-sale-end-date").val(saleClosingDate);
		$("#edit-sale-price").val(salePrice);
		$("#edit-sale-sqft").val(saleSqFt);
		$("#edit-sale-street").val(saleStreet);
		$("#edit-sale-city").val(saleCity);
		$("#edit-sale-buyer-name").val(saleBuyer);
		$("#edit-sale-buyer-email").val(saleBuyerEmail);
		$("#edit-sale-buyer-phone").val(saleBuyerPhone);
		$("#edit-sale-seller-name").val(saleSeller);
		$("#edit-sale-seller-email").val(saleSellerEmail);
		$("#edit-sale-seller-phone").val(saleSellerPhone);
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

	function validateStep() {
		var currentStep = $(".active-step.main-form-step");
		var inputs = currentStep.find("input:required, select:required");
		var isValid = true;

		inputs.each(function() {
			if ($(this).val().trim() === "") {
				isValid = false;
				$(this).addClass("error");
			} else {
				$(this).removeClass("error");
			}
		});
		return isValid;
	}

	function validateBrokers() {
		var selectedBrokers = $("#sale-brokers").val(); // use the .val() method instead
		var isValid = selectedBrokers && selectedBrokers.length > 0;

		if (!isValid) {
			$("#sale-brokers").addClass("error");
		} else {
			$("#sale-brokers").removeClass("error");
		}
		return isValid;
	}

	var currentPage = 1;

	function searchSales(page) {
		var searchTerm = $("#search-input").val().toLowerCase();
		$.ajax({
			url: "/search_sales",
			method: "POST",
			contentType: "application/json",
			data: JSON.stringify({
				query: searchTerm,
				page: page,
			}),
			success: function(search_results_data) {
				var rows = $.map(search_results_data, function(result) {
					var $row = $("<tr>").attr("data-sale-id", result._id);
					$row.append($("<td>").html(result.sale_property_type));
					$row.append($("<td>").html(result.sale_type));
					$row.append($("<td>").html(result.sale_end_date));
					$row.append(
						$("<td>").html(result.sale_price ? result.sale_price : "None")
					);
					$row.append($("<td>").text(result.sale_sqft));
					var price = parseFloat(
						result.sale_price.replace("$", "").replace(",", "")
					);
					var sqft = parseFloat(result.sale_sqft.replace(",", ""));
					if (!isNaN(price) && !isNaN(sqft) && sqft !== 0) {
						var pricePerSqft = price / sqft;
						$row.append($("<td>").text("$" + pricePerSqft.toFixed(2)));
					} else {
						$row.append($("<td>").text("N/A"));
					}
					$row.append($("<td>").text(result.sale_street));
					$row.append($("<td>").text(result.sale_city));
					$row.append(
						$("<td>").html(
							'<a href="mailto:' +
							result.sale_seller_email +
							'">' +
							result.sale_seller +
							"</a>"
						)
					);
					$row.append(
						$("<td>").html(
							'<a href="mailto:' +
							result.sale_buyer_email +
							'">' +
							result.sale_buyer +
							"</a>"
						)
					);
					var brokerElements = $.map(result.brokers, function(broker) {
						return $("<span>").addClass("broker-name").text(broker);
					});
					$row.append($("<td>").append(brokerElements));

					if (result.pdf_file_base64) {
						$row.append(
							$("<td>").html(
								'<a href="/download_sale_pdf/' +
								result._id +
								'">Fully Executed</a>'
							)
						);
					} else {
						$row.append($("<td>").text("Pending"));
					}
					return $row;
				});

				$(".centered-table tbody").empty().append(rows);
			},
			error: function(textStatus, errorThrown) {
				console.error(
					"Error Fetching Search Results:",
					textStatus,
					errorThrown
				);
				showNotification("Error Fetching Search Results", "error-notification-modal");
			},
		});
	}

	$("#search-input").on("input", function() {
		currentPage = 1; // Reset to the first page on a new search
		searchSales(currentPage);
	});

	$("#next-page").on("click", function() {
		currentPage++;
		searchSales(currentPage);
	});

	$("#prev-page").on("click", function() {
		if (currentPage > 1) {
			currentPage--;
			searchSales(currentPage);
		}
	});

	uploadButton.addEventListener("click", function(e) {
		fileInput.click();
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
					var saleClosingDate = $("#edit-sale-end-date").val();
					var salePrice = $("#edit-sale-price").val();
					var saleSqFt = $("#edit-sale-sqft").val();
					var saleStreet = $("#edit-sale-street").val();
					var saleCity = $("#edit-sale-city").val();
					var saleBuyer = $("#edit-sale-buyer-name").val();
					var saleBuyerEmail = $("#edit-sale-buyer-email").val();
					var saleBuyerPhone = $("#edit-sale-seller-phone").val();
					var saleSeller = $("#edit-sale-seller-name").val();
					var saleSellerEmail = $("#edit-sale-seller-email").val();
					var saleSellerPhone = $("#edit-sale-seller-phone").val();

					var data = {
						sale_type: saleType,
						sale_end_date: saleClosingDate,
						sale_price: salePrice,
						sale_sqft: saleSqFt,
						sale_street: saleStreet,
						sale_city: saleCity,
						sale_buyer: saleBuyer,
						sale_buyer_email: saleBuyerEmail,
						sale_buyer_phone: saleBuyerPhone,
						sale_seller: saleSeller,
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
								console.log("Sale Edited Successfully");
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

		if (prevStep.length) {
			currentStep.removeClass("active-step");
			prevStep.addClass("active-step");

			if (!prevStep.prev(".modal-step").length) {
				$(this).addClass("hidden");
			}

			if (currentModal.data("mode") === "add") {
				currentStep.find("input:required, select:required").removeClass("error");
			}
		}
	});

	// UPLOAD DOCUMENT
	fileInput.addEventListener("change", function(e) {
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
					uploadButton.textContent = "Document Uploaded ✔";
					uploadButton.disabled = true;
					document.getElementById("sale-agreement-file-base64").value =
						data.fileBase64;
				} else {
					showNotification("Error Uploading Document", "error-notification-modal");
				}
			},
			error: function() {
				showNotification("Error Uploading Document", "error-notification-modal");
			},
		});
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
					deleteModal.hide(); // hide the modal
					console.log("Sale Deleted Successfully");
				} else {
					console.error("Failed to Delete Sale: " + data.message);
				}
			},
			error: function() {
				console.error("Failed to Delete Sale.");
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