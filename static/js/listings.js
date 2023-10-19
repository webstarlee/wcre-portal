$(document).ready(function () {
	var agreementFileInput = document.getElementById("listing-agreement");
	var uploadButtonAgreement = document.getElementById("upload-listing-agreement");
	var editAgreementFileInput = document.getElementById("edit-listing-agreement");
	var editUploadButtonAgreement = document.getElementById("edit-upload-listing-agreement");
	var amendmentFileInput = document.getElementById("listing-amendment");
	var uploadButtonAmendment = document.getElementById("upload-listing-amendment");
	var editAmendmentFileInput = document.getElementById("edit-listing-amendment");
	var editUploadButtonAmendment = document.getElementById("edit-upload-listing-amendment");
	const ownerPhoneInput = document.getElementById("listing-owner-phone");
	const editOwnerPhoneInput = document.getElementById("edit-listing-owner-phone");
	const listingPriceInput = document.getElementById("listing-price");
	const editListingPriceInput = document.getElementById("edit-listing-price");
	ownerPhoneInput.addEventListener("input", () => formatPhoneNumber(ownerPhoneInput));
	editOwnerPhoneInput.addEventListener("input", () => formatPhoneNumber(editOwnerPhoneInput));
	listingPriceInput.addEventListener("input", () => formatPrice(listingPriceInput));
	editListingPriceInput.addEventListener("input", () => formatPrice(editListingPriceInput));
	$(document).on("input", "#search-input", () => updateSearchListings("input"));
	$(document).on("click", "#next-page", () => updateSearchListings("next"));
	$(document).on("click", "#prev-page", () => updateSearchListings("prev"));

	document.getElementById("open-listing-map-button").onclick = function () {
		initMap();
	}

	document.getElementsByClassName("close")[0].onclick = function () {
		document.getElementById("mapModal").style.display = "none";
	}

	function initMap() {
		let map = new google.maps.Map(document.getElementById('map'), {
			zoom: 12,
			center: new google.maps.LatLng(39.905020, -74.938890)
		});
		let listings = [{
			lat: 39.905020,
			lng: -74.938890
		},];
		for (let i = 0; i < listings.length; i++) {
			new google.maps.Marker({
				position: listings[i],
				map: map
			});
		}
	}


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
		var $brokerInput = $("#listing-brokers");
		var isValid = $brokerInput.val() && $brokerInput.val().length > 0;
		toggleErrorClass($brokerInput, !isValid);
		return isValid;
	}

	function validateDates() {
		var $startDateInput = $("#listing-start-date");
		var isValid = $startDateInput.val().trim().length > 0;
		toggleErrorClass($startDateInput, !isValid);
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

	$(function () {
		$("#listing-start-date").datepicker();
		$("#listing-end-date").datepicker();
		$("#edit-listing-start-date").datepicker();
		$("#edit-listing-end-date").datepicker();
	});

	$("#add-listing-button").click(function () {
		resetModalSteps($("#add-listing-modal"));
		$("body").addClass("modal-open");
		$("#mapModal").hide();
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

	$("#open-listing-map-button").click(function () {
		$("#edit-listing-modal").hide();
		$("#add-listing-modal").hide();
		$("body").addClass("modal-open");
		$("#mapModal").show();
	});


	$("#edit-button").click(function () {
		const editModal = $("#edit-listing-modal");
		const actionModal = $("#action-modal");
		const selectedRow = $(`.centered-table tbody tr[data-listing-id="${listing_id}"]`);
		const getCellText = (index) => selectedRow.find(`td:nth-child(${index})`).text().trim();
		const getEmailFromCell = (index) => selectedRow.find(`td:nth-child(${index}) a[href^="mailto:"]`).attr("href").replace("mailto:", "").trim();
		const getPhoneFromCell = (index) => selectedRow.find(`td:nth-child(${index}) a[href^="tel:"]`).attr("href").replace("tel:", "").trim();
		const getNameFromCell = (index) => getCellText(index).replace(getEmailFromCell(index), '').replace(getPhoneFromCell(index), '').trim();
		const setInputValue = (selector, value) => $(selector).val(value);
		resetModalSteps(editModal);
		$("body").addClass("modal-open");
		$("#add-listing-modal").hide();
		$("#mapModal").hide();
		editModal.show();
		editModal.find(".prev-step").addClass("hidden");
		actionModal.hide();
		editModal.find(".modal-step-title").text("Edit Listing - " + getCellText(5));
		setInputValue("#edit-listing-property-type", getCellText(1));
		setInputValue("#edit-listing-start-date", getCellText(2));
		setInputValue("#edit-listing-end-date", getCellText(3));
		setInputValue("#edit-listing-price", getCellText(4));
		setInputValue("#edit-listing-street", getCellText(5));
		setInputValue("#edit-listing-city", getCellText(6));
		setInputValue("#edit-listing-state", getCellText(7));
		setInputValue("#edit-listing-owner-entity", getCellText(8));
		setInputValue("#edit-listing-owner-name", getNameFromCell(9));
		setInputValue("#edit-listing-owner-email", getEmailFromCell(9));
		setInputValue("#edit-listing-owner-phone", getPhoneFromCell(9));
		const notesContent = getCellText(13);
		if (notesContent && notesContent !== "No Notes") {
			setInputValue("#edit-notes-option", "enter-notes");
			$("#edit-listing-notes").show().val(notesContent);
		} else {
			setInputValue("#edit-notes-option", "no-notes");
			$("#edit-listing-notes").hide().val('');
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

	$(".listing-modal .close").click(function () {
		$("body").removeClass("modal-open");
		$(this).closest(".listing-modal").hide();
	});


	let currentPage = 1;
	const searchListings = (page) => {
		const searchTerm = $("#search-input").val().toLowerCase();
		$.ajax({
			url: "/search_listings",
			method: "POST",
			contentType: "application/json",
			data: JSON.stringify({
				query: searchTerm,
				page
			}),
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
		const stateMapping = {
			"New Jersey": "NJ",
			"Pennsylvania": "PA"
		};
		let stateValue = stateMapping[result.listing_state] || result.listing_state;
		const cells = [
			result.listing_property_type,
			result.listing_start_date,
			`<a href="/create_ics_listing/${result._id}">${result.listing_end_date}</a>`,
			result.listing_price || "None",
			result.listing_street,
			result.listing_city,
			stateValue,
			result.listing_owner_entity,
			`<div class="contact-info">
				<a href="mailto:${result.listing_owner_email}">${result.listing_owner_name}</a>
				<a href="tel:${result.listing_owner_phone}">${result.listing_owner_phone}</a>
			 </div>`,
		];
		cells.forEach(cell => $row.append($("<td>").html(cell)));
		const brokerElements = $.map(result.brokers, broker => $("<span>").addClass("broker-name").text(broker));
		$row.append($("<td>").append(brokerElements));
		$row.append($("<td>").html(result.listing_agreement_file_id ? `<a href="/download/${result.listing_agreement_file_id}">Fully Executed</a>` : "Pending"));
		$row.append($("<td>").html(result.listing_amendment_file_id ? `<a href="/download/${result.listing_amendment_file_id}">Fully Executed</a>` : "Pending"));
		$row.append($("<td>").text(result.listing_notes));
		return $row;
	};

	const handleSearchError = (textStatus, errorThrown) => {
		console.error("Error Fetching Search Results:", textStatus, errorThrown);
		showNotification("Error Fetching Search Results", "error-notification");
	};

	const updateSearchListings = (action) => {
		if (action === "next") {
			currentPage++;
		} else if (action === "prev" && currentPage > 1) {
			currentPage--;
		} else if (action === "input") {
			currentPage = 1;
		}
		searchListings(currentPage);
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
				nextButton.text("Submit Listing");
			} else {
				nextButton.text("Submit Listing Edits");
			}
		} else {
			nextButton.text("Next");
		}
	}


	$(".next-step").on("click", function () {
		var currentModal = $(this).closest(".listing-modal");
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
					$("#submit-listing-form").submit();
				} else if (mode === "edit" && $(this).text() === "Submit Listing Edits") {
					$("#edit-listing-modal").css("display", "none");
					var data = {
						listing_property_type: $("#edit-listing-property-type").val(),
						listing_price: $("#edit-listing-price").val(),
						listing_start_date: $("#edit-listing-start-date").val(),
						listing_end_date: $("#edit-listing-end-date").val(),
						listing_street: $("#edit-listing-street").val(),
						listing_city: $("#edit-listing-city").val(),
						listing_state: $("#edit-listing-state").val(),
						listing_owner_entity: $("#edit-listing-owner-entity").val(),
						listing_owner_name: $("#edit-listing-owner-name").val(),
						listing_owner_email: $("#edit-listing-owner-email").val(),
						listing_owner_phone: $("#edit-listing-owner-phone").val(),
						listing_notes: $("#edit-listing-notes").val(),
						listing_agreement_file_id: $("#edit-listing-agreement-file-id").val(),
						listing_amendment_file_id: $("#edit-listing-amendment-file-id").val()
					};
					getLatLng(data.listing_street, data.listing_city, data.listing_state, function (locationData) {
						if (locationData) {
							data.listing_lat = locationData.lat;
							data.listing_long = locationData.lng;
							$.ajax({
								url: "/edit_listing/" + listing_id,
								type: "POST",
								contentType: "application/json",
								data: JSON.stringify(data),
								success: function (response) {
									if (response.success) {
										location.reload();
									} else {
										showNotification("Error Editing Listing", "error-notification");
									}
								},
								error: function () {
									showNotification("Error Editing Listing", "error-notification");
								},
							});
						} else {
							showNotification("Error Getting Location Data", "error-notification");
						}
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
		var currentModal = $(this).closest(".listing-modal");
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
		inputElement: agreementFileInput,
		buttonElement: uploadButtonAgreement,
		resultElementId: "listing-agreement-file-id"
	},
	{
		inputElement: editAgreementFileInput,
		buttonElement: editUploadButtonAgreement,
		resultElementId: "edit-listing-agreement-file-id"
	},
	{
		inputElement: amendmentFileInput,
		buttonElement: uploadButtonAmendment,
		resultElementId: "listing-amendment-file-id"
	},
	{
		inputElement: editAmendmentFileInput,
		buttonElement: editUploadButtonAmendment,
		resultElementId: "edit-listing-amendment-file-id"
	},
	];

	configurations.forEach(function (config) {
		handleFileUpload(config);
	});

	let listing_id = null;
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
		listing_id = $(this).data("listing-id");
		console.log("Listing ID:", listing_id);
	});


	$(document).bind("click", function (e) {
		const actionModal = $("#action-modal");
		if (!$(e.target).closest(actionModal).length) {
			actionModal.hide();
		}
	});

	$("#delete-button").click(function () {
		const selectedRow = $(
			'.centered-table tbody tr[data-listing-id="' + listing_id + '"]'
		);
		const deleteModal = $("#action-modal");
		$.ajax({
			url: "/delete_listing/" + listing_id,
			type: "GET",
			success: function (response) {
				if (response.success) {
					showNotification("Listing Deleted", "error-notification");
					selectedRow.remove();
					deleteModal.hide();
					$.get("/count/listings", function (response) {
						$("#listings-count").html("Total Listings: " + response.count);
					});
				} else {
					showNotification("Failed to Delete Listing", "error-notification");
				}
			},
			error: function () {
				showNotification("Failed to Delete Listing", "error-notification");
			},
		});
	});

	function getLatLng(street, city, state, callback) {
		var address = `${street}, ${city}, ${state}`;
		var url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyBoKJVMAXzJSwPJUgSLzbbwWz-px77dK_s`
		$.get(url, function (data) {
			if (data.status === 'OK') {
				callback(data.results[0].geometry.location);
			} else {
				showNotification("Error Retreiving Location Data", "error-notification");
				callback(null);
			}
		});
	}


	$("#submit-listing-form").on("submit", function (e) {
		e.preventDefault();
		if (validateStep() && validateBrokers() && validateDates()) {
			$("#add-listing-modal").css("display", "none");
			var formData = new FormData(this);
			formData.append("listing-agreement-file-id", $("#listing-agreement-file-id").val());
			formData.append("listing-amendment-file-id", $("#listing-amendment-file-id").val());
			var street = $("#listing-street").val();
			var city = $("#listing-city").val();
			var state = $("#listing-state").val();
			getLatLng(street, city, state, function (location) {
				if (location) {
					formData.append("listing-lat", location.lat);
					formData.append("listing-long", location.lng);
					$.ajax({
						url: "/submit_listing",
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
								showNotification("Error Uploading Listing", "error-notification")
							}
						})
						.fail(function () {
							showNotification("Error Uploading Listing", "error-notification")
						});
				} else {
					showNotification("Error Getting Location Data", "error-notification");
				}
			});
		}
		else {
			showNotification("Please Fill Out All Required Fields", "error-notification");
		}
	});
});