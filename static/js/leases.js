$(document).ready(function() {
	var agreementFileInput = document.getElementById("lease-agreement");
	var commisionFileInput = document.getElementById("commision-agreement");
  	var uploadButtonAgreement = document.getElementById("upload-lease-agreement");
  	var uploadButtonCommision = document.getElementById("upload-commision-agreement");
	const leasePriceInput = document.getElementById("lease-price");
	const sqFootageInput = document.getElementById("lease-sqft");
	const editsqFootageInput = document.getElementById("edit-lease-sqft");
	const lessorPhoneNumberInput = document.getElementById("lease-lessor-phone");
	const lessePhoneNumberInput = document.getElementById("lease-lesse-phone");
	const leasePercentageSpaceInput = document.getElementById("lease-percentage-space");
	const editLeasePercentageSpaceInput = document.getElementById("edit-lease-percentage-space");
	leasePercentageSpaceInput.addEventListener("input", () => formatPercentage(leasePercentageSpaceInput));
	editLeasePercentageSpaceInput.addEventListener("input", () => formatPercentage(editLeasePercentageSpaceInput));
	leasePriceInput.addEventListener("input", () => formatPrice(leasePriceInput));
	sqFootageInput.addEventListener("input", () => formatSqFootage(sqFootageInput));
	lessorPhoneNumberInput.addEventListener("input", () => formatPhoneNumber(lessorPhoneNumberInput));
	lessePhoneNumberInput.addEventListener("input", () => formatPhoneNumber(lessePhoneNumberInput));
	editsqFootageInput.addEventListener("input", () => formatSqFootage(editsqFootageInput));
	document.getElementById('years').addEventListener('change', adjustTerm);
	document.getElementById('months').addEventListener('change', adjustTerm);


	function showNotification(message, elementId) {
		var notification = $("#" + elementId);
		notification.text(message);
		notification.addClass("show");
		setTimeout(function() {
			notification.removeClass("show");
		}, 2000);
	}

	function adjustTerm() {
		const yearsSelect = document.getElementById('years');
		const monthsSelect = document.getElementById('months');
		const years = parseInt(yearsSelect.value);
		const months = parseInt(monthsSelect.value);
	
		if (months === 12) {
			monthsSelect.value = "0";
			yearsSelect.value = (years + 1).toString();
		}
	}

	document.addEventListener('DOMContentLoaded', function() {
		// For example, let's assume you have a button to get the lease term
		document.getElementById('submit-button').addEventListener('click', function() {
			var years = document.getElementById('years').value;
			var months = document.getElementById('months').value;

			var leaseTermLength = years + " Years " + months + " Months";
			
			// Assuming you have a table cell with an ID 'lease-term-cell'
			document.getElementById('lease-term-cell').innerText = leaseTermLength;
		});
	});


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
		const numberValue = isNaN(parseFloat(numericValue)) ?
			0 :
			parseFloat(numericValue);
		const formattedNumber = new Intl.NumberFormat("en-US").format(numberValue);
		const formattedPrice = numberValue ? `$${formattedNumber}${cents}` : "";
		inputElement.value = formattedPrice;
	}

	function formatPercentage(inputElement) {
		let numericValue = inputElement.value.replace(/[^0-9.]/g, "");
		numericValue = numericValue.replace(/\.+/g, ".");
		const parts = numericValue.split(".");
		if (parts.length > 1) {
			parts[1] = parts[1].substring(0, 2);
			numericValue = parts.join(".");
		}
		if (numericValue) {
			inputElement.value = `${numericValue}%`;
		} else {
			inputElement.value = "";
		}
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
		const numberValue = isNaN(parseFloat(numericValue)) ?
			0 :
			parseFloat(numericValue);
		const formattedNumber = new Intl.NumberFormat("en-US").format(numberValue);
		const formattedSqft = numberValue ? `${formattedNumber}${cents}` : "";
		inputElement.value = formattedSqft;
	}
	$(document).ready(function() {
		const iconVisible = $(".fa-caret-right");
		const iconHidden = $(".fa-caret-down");

		iconHidden.hide();
		$(".centered-table tbody tr[data-lease-id] button").click(function() {
			$(this)
				.closest(".centered-table tbody tr[data-lease-id]")
				.next(".hidden-row-headers")
				.toggle();
			if (
				$(this)
				.closest(".centered-table tbody tr[data-lease-id]")
				.hasClass("selected-child")
			) {
				$(this)
					.closest(".centered-table tbody tr[data-lease-id]")
					.next(".hidden-row-headers")
					.find(".nested-table tr")
					.addClass("selected-child");
			} else {
				$(this)
					.closest(".centered-table tbody tr[data-lease-id]")
					.next(".hidden-row-headers")
					.find(".nested-table tr")
					.addClass("selected-parent");
			}
			if (
				$(this)
				.closest(".centered-table tbody tr[data-lease-id]")
				.next(".hidden-row-headers")
				.is(":hidden")
			) {
				$(this).find(".fa-caret-right").show();
				$(this).find(".fa-caret-down").hide();
			} else {
				$(this).find(".fa-caret-right").hide();
				$(this).find(".fa-caret-down").show();
			}
			$(this).next().next(".hidden-row").toggle();
		});
	});
	$(document).ready(function() {
		$(".parent-row").each(function(index) {
			if (index % 3 === 0) {
				$(this).addClass("selected-parent");
			} else {
				$(this).addClass("selected-child");
			}
		});
	});

	function formatPhoneNumber(inputElement) {
		let phoneNumber = inputElement.value.replace(/\D/g, "");
		if (phoneNumber.length > 10) {
			phoneNumber = phoneNumber.substr(0, 10);
		}
		const formattedPhoneNumber = formatToPhoneNumber(phoneNumber);
		inputElement.value = formattedPhoneNumber;
	}

	function formatToPhoneNumber(phoneNumber) {
		const formattedNumber = phoneNumber.replace(
			/(\d{3})(\d{3})(\d{4})/,
			"$1-$2-$3"
		);
		return formattedNumber;
	}

	// OPEN ADD LEASES MODAL
	$("#add-lease-button").click(function() {
		resetModalSteps($("#add-lease-modal"));
		$("body").addClass("modal-open");
		$("#edit-lease-modal").hide();
		$("#add-lease-modal").show();
		$("#add-lease-modal .prev-step").addClass("hidden");
	});

	function resetModalSteps(modal) {
		modal.find(".modal-step").removeClass("active-step");
		modal.find(".modal-step:first").addClass("active-step");
		modal.find(".prev-step").addClass("hidden");
		modal.find(".next-step").text("Next");
	}

	$("#edit-button").click(function() {
		const editModal = $("#edit-lease-modal");
		const actionModal = $("#action-modal");
		const selectedRow = $(`.centered-table tbody tr[data-lease-id="${lease_id}"]`);
		const getCellText = (index) => selectedRow.find(`td:nth-child(${index})`).text().trim();
		const getEmailFromCell = (index) => selectedRow.find(`td:nth-child(${index}) a[href^="mailto:"]`).attr("href").replace("mailto:", "").trim();
		const getPhoneFromCell = (index) => selectedRow.find(`td:nth-child(${index}) a[href^="tel:"]`).attr("href").replace("tel:", "").trim();
		const getNameFromCell = (index) => getCellText(index).replace(getEmailFromCell(index), '').replace(getPhoneFromCell(index), '').trim();
		const setInputValue = (selector, value) => $(selector).val(value);
		
		resetModalSteps(editModal);
		$("body").addClass("modal-open");
		$("#add-lease-modal").hide();
		editModal.show();
		editModal.find(".prev-step").addClass("hidden");
		actionModal.hide();
		editModal.find(".modal-step-title").text("Edit Lease - " + getCellText(7));
		setInputValue("#edit-lease-property-type", getCellText(1));
		setInputValue("#edit-lease-price", getCellText(2));
		setInputValue("#edit-lease-sqft", getCellText(3));
		setInputValue("#edit-lease-percentage-space", getCellText(5));
		setInputValue("#edit-lease-term-length", getCellText(6));
		setInputValue("#edit-lease-street", getCellText(7));
		setInputValue("#edit-lease-city", getCellText(8));
		setInputValue("#edit-lease-state", getCellText(9));
		setInputValue("#edit-lease-lessor-name", getNameFromCell(10));
		setInputValue("#edit-lease-lessor-email", getEmailFromCell(10));
		setInputValue("#edit-lease-lessor-phone", getPhoneFromCell(10));
		setInputValue("#edit-lease-lesse-name", getNameFromCell(11));
		setInputValue("#edit-lease-lesse-email", getEmailFromCell(11));
		setInputValue("#edit-lease-lesse-phone", getPhoneFromCell(11));
	});
	

	// CLOSE ADD LESAE MODAL
	$("#add-lease-modal .close").click(function() {
		$("body").removeClass("modal-open");
		$("#add-lease-modal").hide();
	});

	// CLOSE EDIT LEASE MODAL
	$("#edit-lease-modal .close").click(function() {
		$("body").removeClass("modal-open");
		$("#edit-lease-modal").hide();
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
		var selectedBrokers = $("#lease-brokers").val(); // use the .val() method instead
		var isValid = selectedBrokers && selectedBrokers.length > 0;

		if (!isValid) {
			$("#lease-brokers").addClass("error");
		} else {
			$("#lease-brokers").removeClass("error");
		}
		return isValid;
	}

	$(".next-step").on("click", function() {
		var currentModal = $(this).closest(".lease-modal");
		var mode = currentModal.data("mode");
		var currentStep = currentModal.find(".active-step");
		var nextStep = currentStep.next(".modal-step");
		var isValid = mode === "edit" || validateStep();

		if (isValid) {
			if (nextStep.length) {
				currentStep.removeClass("active-step");
				nextStep.addClass("active-step");
				currentModal.find(".prev-step").removeClass("hidden");

				if (!nextStep.next(".modal-step").length) {
					if (mode === "add") {
						$(this).text("Submit Lease");
					} else {
						$(this).text("Submit Lease Edits");
					}
				} else {
					$(this).text("Next");
				}
			} else {
				if (mode === "add" && validateBrokers()) {
					$("#submit-lease-form").submit();
				} else if (mode === "edit" && $(this).text() === "Submit Lease Edits") {
					console.log("in here")
					$("#edit-lease-modal").css("display", "none");
					var leasePropertyType = $("#edit-lease-property-type").val();
					var leasePrice = $("#edit-lease-price").val();
					var leaseSqFt = $("#edit-lease-sqft").val();
					var leaseSpacePercentage = $("#edit-lease-percentage-space").val();
					var leaseTermLength = $("#edit-lease-term-length").val();
					var leaseStreet = $("#edit-lease-street").val();
					var leaseCity = $("#edit-lease-city").val();
					var leaseState = $("#edit-lease-state").val();
					var leaseLessor = $("#edit-lease-lessor-name").val();
					var leaseLessorEmail = $("#edit-lease-lessor-email").val();
					var leaseLessorPhone = $("#edit-lease-lessor-phone").val();
					var leaseLesse = $("#edit-lease-lesse-name").val();
					var leaseLesseEmail = $("#edit-lease-lesse-email").val();
					var leaseLessePhone = $("#edit-lease-lesse-phone").val();

					var data = {
						lease_property_type: leasePropertyType,
						lease_price: leasePrice,
						lease_sqft: leaseSqFt,
						lease_term_length: leaseTermLength,
						lease_percentage_space: leaseSpacePercentage,
						lease_street: leaseStreet,
						lease_city: leaseCity,
						lease_state: leaseState,
						lease_lessor_name: leaseLessor,
						lease_lessor_email: leaseLessorEmail,
						lease_lessor_phone: leaseLessorPhone,
						lease_lesse_name: leaseLesse,
						lease_lesse_email: leaseLesseEmail,
						lease_lesse_phone: leaseLessePhone
					};

					$.ajax({
						url: "/edit_lease/" + lease_id,
						type: "POST",
						contentType: "application/json",
						data: JSON.stringify(data),
						success: function(response) {
							if (response.success) {
								location.reload();
							} else {
								showNotification("Error Editing lease", "error-notification-modal");
							}
						},
						error: function() {
							showErrorNotificationModal("Error Editing lease");
						},
					});
				} else {
					showNotification(
						"Please Fill Out All Required Fields",
						"error-notification-modal"
					);
				}
			}
		} else {
			showNotification(
				"Please Fill Out All Required Fields",
				"error-notification-modal"
			);
		}
	});

	// PREV STEP
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
					nextButton.text("Submit Lease");
				} else {
					nextButton.text("Submit Lease Edits");
				}
			} else {
				nextButton.text("Next");
			}
	
			if (currentModal.data("mode") === "add") {
				currentStep.find("input:required, select:required").removeClass("error");
			}
		}
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

	let lease_id = null;
	$(".centered-table tbody tr").on("contextmenu", function(e) {
		e.preventDefault();
		lease_id = $(this).data("lease-id");
		console.log("Lease ID:", lease_id);
	});

	$("#delete-button").click(function() {
		const selectedRow = $(
			'.centered-table tbody tr[data-lease-id="' + lease_id + '"]'
		);
		const deleteModal = $("#action-modal"); // assuming this is the ID of your deletion modal
		$.ajax({
			url: "/delete_lease/" + lease_id,
			type: "GET",
			success: function(data) {
				if (data.success) {
					showNotification("Lease Deleted", "error-notification");
					selectedRow.remove();
					deleteModal.hide();
					$.get("/count/leases", function(response) {
						$("#leases-count").html("Total Leases: " + response.count);
					});
				} else {
					showNotification("Failed to Delete Lease", "error-notification");
				}
			},
			error: function() {
				showNotification("Failed to Delete Lease", "error-notification");
			},
		});
	});

	function uploadDocument(fileInput, uploadButton, fileBase64Id) {
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
						document.getElementById(fileBase64Id).value = data.fileBase64;
					} else {
						showNotification("Error Uploading Document", "error-notification-modal");
					}
				},
				error: function() {
					showNotification("Error Uploading Document", "error-notification-modal");
				},
			});
		});
	}

	let currentPage = 1;
	const searchLeases = (page) => {
		const searchTerm = $("#search-input").val().toLowerCase();
		$.ajax({
			url: "/search_leases",
			method: "POST",
			contentType: "application/json",
			data: JSON.stringify({ query: searchTerm, page }),
			success: renderSearchResults,
			error: handleSearchError
		});
	};

	const renderSearchResults = (search_results_data) => {
		const rows = search_results_data.map(result => createRowForLease(result));
		$(".centered-table tbody").empty().append(rows);
	};

	const createRowForLease = (result) => {
		const $row = $("<tr>").attr("data-lease-id", result._id);
		const cells = [
			result.lease_property_type,
			result.lease_price || "None",
			result.lease_sqft,
			calculatePricePerSqft(result.lease_price, result.lease_sqft),
			result.lease_percentage_space,
			result.lease_term_length,
			result.lease_street,
			result.lease_city,
			`<a href="mailto:${result.lease_lessor_email}">${result.lease_lessor_name}</a>`,
			`<a href="mailto:${result.lease_lesse_email}">${result.lease_lesse_name}</a>`,
		];
		cells.forEach(cell => $row.append($("<td>").html(cell)));
		const brokerElements = $.map(result.brokers, broker => $("<span>").addClass("broker-name").text(broker));
		$row.append($("<td>").append(brokerElements));
		$row.append($("<td>").html(result.lease_agreement_pdf_file_base64 ? `<a href="/download_lease_agreement_pdf/${result._id}">Fully Executed</a>` : "Pending"));
		$row.append($("<td>").html(result.lease_commision_pdf_file_base64 ? `<a href="/download_lease_commision_pdf/${result._id}">Fully Executed</a>` : "Pending"));
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

	const handleSearchError = (textStatus, errorThrown) => {
		console.error("Error Fetching Lease Results:", textStatus, errorThrown);
		showNotification("Error Fetching Lease Results", "error-notification-modal");
	};

	$("#search-input").on("input", () => {
		currentPage = 1;
		searchLeases(currentPage);
	});

	$("#next-page").on("click", () => {
		currentPage++;
		searchLeases(currentPage);
	});

	$("#prev-page").on("click", () => {
		if (currentPage > 1) {
			currentPage--;
			searchLeases(currentPage);
		}
	});

	function setupButtonAndInput(button, input) {
		button.addEventListener("click", function(e) {
			input.click();
		});
	}

	setupButtonAndInput(uploadButtonAgreement, agreementFileInput);
	setupButtonAndInput(uploadButtonCommision, commisionFileInput);
	uploadDocument(agreementFileInput, uploadButtonAgreement, "lease-agreement-file-base64");
	uploadDocument(commisionFileInput, uploadButtonCommision, "commision-agreement-file-base64");

	$(".modal-content").click(function(event) {
		event.stopPropagation();
	});

	// SUBMIT LEASE
	$("#submit-lease-form").on("submit", function(e) {
		e.preventDefault();
		$("#add-lease-modal").css("display", "none");
		if (validateStep() && validateBrokers()) {
			var formData = new FormData(this);
			var leaseAgreementFileBase64 = $("#lease-agreement-file-base64").val();
			var commisionAgreementFileBase64 = $("#commision-agreement-file-base64").val();
			formData.append("lease-agreement-file-base64", leaseAgreementFileBase64);
      		formData.append("commision-agreement-file-base64", commisionAgreementFileBase64);
			$.ajax({
					url: "/submit_lease",
					type: "POST",
					data: formData,
					processData: false,
					contentType: false,
					dataType: "json",
				})
				.done(function(response) {
					if (response.status === "success") {
						window.location.href = response.redirect;
					} else {
						showNotification("Error Uploading Lease", "error-notification");
					}
				})
				.fail(function() {
					showNotification("Error Uploading Lease", "error-notification");
				});
		}
	});
});