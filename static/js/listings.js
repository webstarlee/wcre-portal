$(document).ready(function() {
	var fileInput = document.getElementById("listing-agreement");
	var uploadButton = document.getElementById("upload-listing-agreement");
	const ownerPhoneInput = document.getElementById("listing-owner-phone");
	const editOwnerPhoneInput = document.getElementById("edit-listing-owner-phone");
	const listingPriceInput = document.getElementById("listing-price");
	const editListingPriceInput = document.getElementById("edit-listing-price");
	ownerPhoneInput.addEventListener("input", () => formatPhoneNumber(ownerPhoneInput));
	editOwnerPhoneInput.addEventListener("input", () => formatPhoneNumber(editOwnerPhoneInput));
	listingPriceInput.addEventListener("input", () => formatPrice(listingPriceInput));
	editListingPriceInput.addEventListener("input", () => formatPrice(editListingPriceInput));

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

	$(function() {
		$("#listing-start-date").datepicker();
		$("#listing-end-date").datepicker();
		$("#edit-listing-start-date").datepicker();
		$("#edit-listing-end-date").datepicker();
	});

	// OPEN ADD LISTING MODAL
	$("#add-listing-button").click(function() {
		resetModalSteps($("#add-listing-modal"));
		$("body").addClass("modal-open");
		$("#edit-listing-modal").hide();
		$("#add-listing-modal").show();
		$("#add-listing-modal .prev-step").addClass("hidden");
	});

	function resetModalSteps(modal) {
		modal.find(".modal-step").removeClass("active-step");
		modal.find(".modal-step:first").addClass("active-step");
		modal.find(".prev-step").addClass("hidden");
		modal.find(".next-step").text("Next");
	}


	// OPEN EDIT LISTING MODAL
	$("#edit-button").click(function() {
		const editModal = $("#edit-listing-modal");
		const actionModal = $("#action-modal");
		const selectedRow = $(`.centered-table tbody tr[data-listing-id="${listing_id}"]`);
		const getCellText = (index) => selectedRow.find(`td:nth-child(${index})`).text().trim();
		const setInputValue = (selector, value) => $(selector).val(value);
		resetModalSteps(editModal);
		$("body").addClass("modal-open");
		$("#add-listing-modal").hide();
		editModal.show();
		editModal.find(".prev-step").addClass("hidden");
		actionModal.hide();
		editModal.find(".modal-step-title").text("Edit Listing - " + getCellText(6));
		setInputValue("#edit-listing-start-date", getCellText(3));
		setInputValue("#edit-listing-end-date", getCellText(4));
		setInputValue("#edit-listing-price", getCellText(5));
		setInputValue("#edit-listing-street", getCellText(6));
		setInputValue("#edit-listing-city", getCellText(7));
		setInputValue("#edit-listing-owner-name", getCellText(8));
		setInputValue("#edit-listing-owner-email", selectedRow.find("td:nth-child(8) a").attr("href").replace("mailto:", "").trim());
		setInputValue("#edit-listing-owner-phone", getCellText(9));
	});
	

	// CLOSE ADD LISTING MODAL
	$("#add-listing-modal .close").click(function() {
		$("body").removeClass("modal-open");
		$("#add-listing-modal").hide();
	});

	// CLOSE EDIT LISTING MODAL
	$("#edit-listing-modal .close").click(function() {
		$("body").removeClass("modal-open");
		$("#edit-listing-modal").hide();
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
		var selectedBrokers = $("#listing-brokers").val(); // use the .val() method instead
		var isValid = selectedBrokers && selectedBrokers.length > 0;

		if (!isValid) {
			$("#listing-brokers").addClass("error");
		} else {
			$("#listing-brokers").removeClass("error");
		}
		return isValid;
	}

	function validateDates() {
		var startDateInput = $("#listing-start-date");
		var isValid = startDateInput.val().trim().length > 0;

		if (!isValid) {
			$("#listing-start-date").addClass("error");
		} else {
			$("#listing-start-date").removeClass("error");
		}
		return isValid;
	}

	let currentPage = 1;
	const searchListings = (page) => {
		const searchTerm = $("#search-input").val().toLowerCase();
		$.ajax({
			url: "/search_listings",
			method: "POST",
			contentType: "application/json",
			data: JSON.stringify({ query: searchTerm, page }),
			success: renderSearchResults,
			error: handleSearchError
		});
	};

	const renderSearchResults = (search_results_data) => {
		const rows = search_results_data.map(result => createRowForListing(result));
		$(".centered-table tbody").empty().append(rows);
	};

	const createRowForListing = (result) => {
		const $row = $("<tr>").attr("data-listing-id", result._id);
		const cells = [
			result.listing_property_type,
			result.listing_type,
			result.listing_start_date,
			`<a href="/create_ics_listing/${result._id}">${result.listing_end_date}</a>`,
			result.listing_price || "None",
			result.listing_street,
			result.listing_city,
			`<a href="mailto:${result.listing_owner_email}">${result.listing_owner_name}</a>`,
			`<a href="tel:${result.listing_owner_phone}">${result.listing_owner_phone}</a>`,
		];

		cells.forEach(cell => $row.append($("<td>").html(cell)));
		const brokerElements = $.map(result.brokers, broker => $("<span>").addClass("broker-name").text(broker));
		$row.append($("<td>").append(brokerElements));
		$row.append($("<td>").html(result.pdf_file_base64 ? `<a href="/download_listing_pdf/${result._id}">Fully Executed</a>` : "Pending"));
		return $row;
	};

	const handleSearchError = (textStatus, errorThrown) => {
		console.error("Error Fetching Search Results:", textStatus, errorThrown);
		showNotification("Error Fetching Search Results", "error-notification-modal");
	};

	$("#search-input").on("input", () => {
		currentPage = 1;
		searchListings(currentPage);
	});

	$("#next-page").on("click", () => {
		currentPage++;
		searchListings(currentPage);
	});

	$("#prev-page").on("click", () => {
		if (currentPage > 1) {
			currentPage--;
			searchListings(currentPage);
		}
	});


	uploadButton.addEventListener("click", function(e) {
		fileInput.click();
	});

	$(".modal-content").click(function(event) {
		event.stopPropagation();
	});


	$(".next-step").on("click", function() {
		var currentModal = $(this).closest(".listing-modal");
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
						$(this).text("Submit Listing");
					} else {
						$(this).text("Submit Listing Edits");
					}
				} else {
					$(this).text("Next");
				}
			} else {
				if (mode === "add" && validateBrokers()) {
					$("#submit-listing-form").submit();
				} else if (mode === "edit" && $(this).text() === "Submit Listing Edits") {
					$("#edit-listing-modal").css("display", "none");
					var listingPrice = $("#edit-listing-price").val();
					var listingStartDate = $("#edit-listing-start-date").val();
					var listingEndDate = $("#edit-listing-end-date").val();
					var listingStreet = $("#edit-listing-street").val();
					var listingCity = $("#edit-listing-city").val();
					var listingOwner = $("#edit-listing-owner-name").val();
					var listingEmail = $("#edit-listing-owner-email").val();
					var listingPhone = $("#edit-listing-owner-phone").val();

					var data = {
						listing_price: listingPrice,
						listing_start_date: listingStartDate,
						listing_end_date: listingEndDate,
						listing_street: listingStreet,
						listing_city: listingCity,
						listing_owner: listingOwner,
						listing_email: listingEmail,
						listing_phone: listingPhone,
					};

					$.ajax({
						url: "/edit_listing/" + listing_id,
						type: "POST",
						contentType: "application/json",
						data: JSON.stringify(data),
						success: function(response) {
							if (response.success) {
								location.reload();
							} else {
								showNotification("Error Editing listing", "error-notification-modal");
							}
						},
						error: function() {
							showNotification("Error Editing listing", "error-notification-modal");
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
		var currentModal = $(this).closest(".lease-modal");
		var currentStep = currentModal.find(".active-step");
		var prevStep = currentStep.prev(".modal-step");
		var nextButton = currentModal.find(".next-step");

		if (prevStep.length) {
			currentStep.removeClass("active-step");
			prevStep.addClass("active-step");
	
			if (!prevStep.next(".modal-step").length) {
				if (currentModal.data("mode") === "add") {
					nextButton.text("Submit Listing");
				} else {
					nextButton.text("Submit Listing Edits");
				}
			} else {
				nextButton.text("Next");
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
					document.getElementById("listing-agreement-file-base64").value =
						data.fileBase64;
				} else {
					showNotification("Error Uploading Document", "error-notification-modal");
				}
			},
			error: function(xhr, status, error) {
				showNotification("Error Uploading Document", "error-notification-modal");
			},
		});
	});

	// OPEN ACTION MODAL
	var isAdmin = $("body").data("is-admin") === "True";
	$(".centered-table tbody tr").on("contextmenu", function(e) {
		if (isAdmin) {
			// Check if user is an admin
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

	$(document).bind("click", function(e) {
		const actionModal = $("#action-modal");
		if (!$(e.target).closest(actionModal).length) {
			actionModal.hide();
		}
	});

	let listing_id = null;
	$(".centered-table tbody tr").on("contextmenu", function(e) {
		e.preventDefault();
		listing_id = $(this).data("listing-id");
		console.log("Listing ID:", listing_id);
	});

	$("#delete-button").click(function() {
		const selectedRow = $(
			'.centered-table tbody tr[data-listing-id="' + listing_id + '"]'
		);
		const deleteModal = $("#action-modal"); // assuming this is the ID of your deletion modal
		$.ajax({
			url: "/delete_listing/" + listing_id,
			type: "GET",
			success: function(data) {
				if (data.success) {
					showNotification("Listing Deleted", "error-notification");
					selectedRow.remove();
					deleteModal.hide();
					$.get("/count/listings", function(response) {
						$("#listings-count").html("Total Listings: " + response.count);
					});
				} else {
					showNotification("Failed to Delete Listing", "error-notification");
				}
			},
			error: function() {
				showNotification("Failed to Delete Listing", "error-notification");
			},
		});
	});

	// SUBMIT LISTING
	$("#submit-listing-form").on("submit", function(e) {
		e.preventDefault();
		$("#add-listing-modal").css("display", "none");

		if (validateStep() && validateBrokers() && validateDates()) {
			var formData = new FormData(this);
			var fileBase64 = $("#listing-agreement-file-base64").val();
			formData.append("fileBase64", fileBase64);

			$.ajax({
					url: "/submit_listing",
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
						showNotification("Error Uploading Listing", "error-notification")
					}
				})
				.fail(function() {
					showNotification("Error Uploading Listing", "error-notification")
				});
		}
	});
});