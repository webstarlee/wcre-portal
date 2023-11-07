$(document).ready(function () {
	var agreementFileInput = document.getElementById("lease-agreement");
	var uploadButtonAgreement = document.getElementById("upload-lease-agreement");
	var editAgreementFileInput = document.getElementById("edit-lease-agreement");
	var editUploadButtonAgreement = document.getElementById("edit-upload-lease-agreement");
	var commissionFileInput = document.getElementById("lease-commission-agreement");
	var uploadButtonCommission = document.getElementById("upload-lease-commission-agreement");
	var editCommissionFileInput = document.getElementById("edit-lease-commission-agreement");
	var editUploadButtonCommission = document.getElementById("edit-upload-lease-commission-agreement")
	var commissionInvoiceFileInput = document.getElementById("lease-commission-invoice");
	var uploadButtonCommissionInvoice = document.getElementById("upload-lease-commission-invoice");
	var editCommissionInvoiceFileInput = document.getElementById("edit-lease-commission-invoice");
	var editUploadButtonCommissionInvoice = document.getElementById("edit-upload-lease-commission-invoice")
	const sqFootageInput = document.getElementById("lease-sqft");
	const editsqFootageInput = document.getElementById("edit-lease-sqft");
	const lessorPhoneNumberInput = document.getElementById("lease-lessor-phone");
	const lesseePhoneNumberInput = document.getElementById("lease-lessee-phone");
	const editLessorPhoneNumberInput = document.getElementById("edit-lease-lessor-phone");
	const editLesseePhoneNumberInput = document.getElementById("edit-lease-lessee-phone");
	document.getElementById('years').addEventListener('change', adjustTerm);
	document.getElementById('months').addEventListener('change', adjustTerm);
	sqFootageInput.addEventListener("input", () => formatSqFootage(sqFootageInput));
	editsqFootageInput.addEventListener("input", () => formatSqFootage(editsqFootageInput));
	lessorPhoneNumberInput.addEventListener("input", () => formatPhoneNumber(lessorPhoneNumberInput));
	lesseePhoneNumberInput.addEventListener("input", () => formatPhoneNumber(lesseePhoneNumberInput));
	editLessorPhoneNumberInput.addEventListener("input", () => formatPhoneNumber(editLessorPhoneNumberInput));
	editLesseePhoneNumberInput.addEventListener("input", () => formatPhoneNumber(editLesseePhoneNumberInput));
	$(document).on("input", "#search-input", () => updateSearchLeases("input"));
	$(document).on("click", "#next-page", () => updateSearchLeases("next"));
	$(document).on("click", "#prev-page", () => updateSearchLeases("prev"));


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
		console.log("checking");
		var $brokerInput = $("#lease-brokers");
		var isValid = $brokerInput.val() && $brokerInput.val().length > 0;
		console.log(isValid)
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

	document.addEventListener('DOMContentLoaded', function () {
		document.getElementById('submit-button').addEventListener('click', function () {
			var years = document.getElementById('years').value;
			var months = document.getElementById('months').value;
			var leaseTermLength = years + " Years " + months + " Months";
			document.getElementById('lease-term-cell').innerText = leaseTermLength;
		});
	});

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
		const formattedSqft = numberValue ? `${formattedNumber}${cents} SF` : "";
		inputElement.value = formattedSqft;
	}


	$("#add-lease-button").click(function () {
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

	$("#edit-button").click(function () {
		const editModal = $("#edit-lease-modal");
		const actionModal = $("#action-modal");
		const selectedRow = $(`.centered-table tbody tr[data-lease-id="${lease_id}"]`);
		const getCellText = (index) => selectedRow.find(`td:nth-child(${index})`).text().trim();
		const getEmailFromCell = (index) => selectedRow.find(`td:nth-child(${index}) a[href^="mailto:"]`).attr("href").replace("mailto:", "").trim();
		const getPhoneFromCell = (index) => selectedRow.find(`td:nth-child(${index}) a[href^="tel:"]`).attr("href").replace("tel:", "").trim();
		const getNameFromCell = (index) => selectedRow.find(`td:nth-child(${index}) a[href^="mailto:"]`).text().trim();
		const getLessorEntityFromCell = (index) => selectedRow.find(`td:nth-child(${index}) .lessor-entity`).text().trim();
		const getLesseeEntityFromCell = (index) => selectedRow.find(`td:nth-child(${index}) .lessee-entity`).text().trim();
		const setInputValue = (selector, value) => $(selector).val(value);
		resetModalSteps(editModal);
		$("body").addClass("modal-open");
		$("#add-lease-modal").hide();
		editModal.show();
		editModal.find(".prev-step").addClass("hidden");
		actionModal.hide();
		editModal.find(".modal-step-title").text("Edit Lease - " + getCellText(4));
		setInputValue("#edit-lease-property-type", getCellText(1));
		setInputValue("#edit-lease-sqft", getCellText(2));
		setInputValue("#edit-lease-term-length", getCellText(3));
		setInputValue("#edit-lease-street", getCellText(4));
		setInputValue("#edit-lease-city", getCellText(5));
		setInputValue("#edit-lease-state", getCellText(6));
		setInputValue("#edit-lease-lessor-entity", getLessorEntityFromCell(7));
		setInputValue("#edit-lease-lessor-name", getNameFromCell(7));
		setInputValue("#edit-lease-lessor-email", getEmailFromCell(7));
		setInputValue("#edit-lease-lessor-phone", getPhoneFromCell(7));
		setInputValue("#edit-lease-lessee-entity", getLesseeEntityFromCell(8));
		setInputValue("#edit-lease-lessee-name", getNameFromCell(8));
		setInputValue("#edit-lease-lessee-email", getEmailFromCell(8));
		setInputValue("#edit-lease-lessee-phone", getPhoneFromCell(8));
		setInputValue("#edit-lease-referral-source", getCellText(13));
		setInputValue("#edit-lease-invoice-contact", getCellText(14));
		const notesContent = getCellText(15);
		if (notesContent && notesContent !== "No Notes") {
			setInputValue("#edit-notes-option", "enter-notes");
			$("#edit-lease-notes").show().val(notesContent);
		} else {
			setInputValue("#edit-notes-option", "no-notes");
			$("#edit-lease-notes").hide().val('');
		}
	});

	$('tr[data-lease-id]').click(function () {
		$(this).toggleClass('expanded');
		var notesCell = $(this).find('td.notes-cell');
		if ($(this).hasClass('expanded')) {
			var fullNotes = notesCell.data('full-notes');
			notesCell.html(fullNotes.replace(/\n/g, "<br>"));
		} else {
			var truncated = notesCell.data('full-notes').substring(0, 38) + '...';
			notesCell.text(truncated);
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


	$(".lease-modal .close").click(function () {
		$("body").removeClass("modal-open");
		$(this).closest(".lease-modal").hide();
	});

	let currentPage = 1;
	const searchLeases = (page) => {
		const searchTerm = $("#search-input").val().toLowerCase();
		$.ajax({
			url: "/search_leases",
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
		const rows = search_results_data.map(result => createRowForLease(result));
		$(".centered-table tbody").empty().append(rows);
	};

	const createRowForLease = (result) => {
		const $row = $("<tr>").attr("data-lease-id", result._id);
		const stateMapping = {
			"New Jersey": "NJ",
			"Pennsylvania": "PA"
		};
		let stateValue = stateMapping[result.lease_state] || result.lease_state;
		const cells = [
			result.lease_property_type,
			result.lease_sqft,
			result.lease_term_length,
			result.lease_street,
			result.lease_city,
			stateValue,
			`<div class="contact-info">
				<div class="lessor-entity">${result.lease_lessor_entity}</div>
				<a href="mailto:${result.lease_lessor_email}">${result.lease_lessor_name}</a>
				<a href="tel:${result.lease_lessor_phone}">${result.lease_lessor_phone}</a>
			 </div>`,
			`<div class="contact-info">
				<div class="lessee-entity">${result.lease_lessee_entity}</div>
				<a href="mailto:${result.lease_lessee_email}">${result.lease_lessee_name}</a>
				<a href="tel:${result.lease_lessee_phone}">${result.lease_lessee_phone}</a>
			 </div>`
		];
		cells.forEach(cell => $row.append($("<td>").html(cell)));
		const brokerElements = $.map(result.brokers, broker => $("<span>").addClass("broker-name").text(broker));
		$row.append($("<td>").addClass("brokers").append(brokerElements));
		$row.append($("<td>").html(result.lease_agreement_file_id ? `<form method="POST"><a href="/download/${result.lease_agreement_file_id}">Fully Executed</a></form>` : "Pending"));
		$row.append($("<td>").html(result.lease_commission_file_id ? `<form method="POST"><a href="/download/${result.lease_commission_file_id}">Fully Executed</a></form>` : "Pending"));
		$row.append($("<td>").html(result.lease_commission_invoice_file_id ? `<form method="POST"><a href="/download/${result.lease_commission_invoice_file_id}">Fully Executed</a></form>` : "Pending"));
		$row.append($("<td>").text(result.lease_referral_source));
		$row.append($("<td>").text(result.lease_invoice_contact));
		$row.append($("<td>").text(result.lease_notes));
		return $row;
	};


	const handleSearchError = (textStatus, errorThrown) => {
		console.error("Error Fetching Lease Results:", textStatus, errorThrown);
		showNotification("Error Fetching Lease Results", "error-notification");
	};

	const updateSearchLeases = (action) => {
		if (action === "next") {
			currentPage++;
		} else if (action === "prev" && currentPage > 1) {
			currentPage--;
		} else if (action === "input") {
			currentPage = 1;
		}
		searchLeases(currentPage);
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
				nextButton.text("Submit Lease");
			} else {
				nextButton.text("Submit Lease Edits");
			}
		} else {
			nextButton.text("Next");
		}
	}

	$(".next-step").on("click", function () {
		var currentModal = $(this).closest(".lease-modal");
		var mode = currentModal.data("mode");
		var currentStep = currentModal.find(".active-step");
		var nextStep = currentStep.next(".modal-step");
		var isValid = mode === "edit" || validateStep();
		if (isValid) {
			if (nextStep.length) {
				currentStep.removeClass("active-step");
				nextStep.addClass("active-step");
				updateUIBasedOnStep(nextStep, currentModal);
			} else {
				if (mode === "add") {
					$("#submit-lease-form").submit();
				} else if (mode === "edit" && $(this).text() === "Submit Lease Edits") {
					$("#edit-lease-modal").css("display", "none");
					var data = {
						lease_property_type: $("#edit-lease-property-type").val(),
						lease_sqft: $("#edit-lease-sqft").val(),
						lease_term_length: $("#edit-lease-term-length").val(),
						lease_agreement_file_id: $("#edit-lease-agreement-file-id").val(),
						lease_commission_file_id: $("#edit-lease-commission-agreement-file-id").val(),
						lease_commission_invoice_file_id: $("#edit-lease-commission-invoice-file-id").val(),
						lease_street: $("#edit-lease-street").val(),
						lease_city: $("#edit-lease-city").val(),
						lease_state: $("#edit-lease-state").val(),
						lease_lessor_entity: $("#edit-lease-lessor-entity").val(),
						lease_lessor_name: $("#edit-lease-lessor-name").val(),
						lease_lessor_email: $("#edit-lease-lessor-email").val(),
						lease_lessor_phone: $("#edit-lease-lessor-phone").val(),
						lease_lessee_entity: $("#edit-lease-lessee-entity").val(),
						lease_lessee_name: $("#edit-lease-lessee-name").val(),
						lease_lessee_email: $("#edit-lease-lessee-email").val(),
						lease_lessee_phone: $("#edit-lease-lessee-phone").val(),
						lease_referral_source: $("#edit-lease-referral-source").val(),
						lease_invoice_contact: $("#edit-lease-invoice-contact").val(),
						lease_notes: $("#edit-lease-notes").val()
					};
					console.log(data);
					$.ajax({
						url: "/edit_lease/" + lease_id,
						type: "POST",
						contentType: "application/json",
						data: JSON.stringify(data),
						success: function (response) {
							if (response.success) {
								location.reload();
							} else {
								showNotification("Error Editing Lease", "error-notification");
							}
						},
						error: function () {
							showErrorNotificationModal("Error Editing lease");
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
		var currentModal = $(this).closest(".lease-modal");
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
					showNotification("Error Uploading Document", "error-notification-modal");
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
		resultElementId: "lease-agreement-file-id"
	},
	{
		inputElement: editAgreementFileInput,
		buttonElement: editUploadButtonAgreement,
		resultElementId: "edit-lease-agreement-file-id"
	},
	{
		inputElement: commissionFileInput,
		buttonElement: uploadButtonCommission,
		resultElementId: "lease-commission-agreement-file-id"
	},
	{
		inputElement: editCommissionFileInput,
		buttonElement: editUploadButtonCommission,
		resultElementId: "edit-lease-commission-agreement-file-id"
	},
	{
		inputElement: commissionInvoiceFileInput,
		buttonElement: uploadButtonCommissionInvoice,
		resultElementId: "lease-commission-invoice-file-id"
	},
	{
		inputElement: editCommissionInvoiceFileInput,
		buttonElement: editUploadButtonCommissionInvoice,
		resultElementId: "edit-lease-commission-invoice-file-id"
	}
	];

	configurations.forEach(function (config) {
		handleFileUpload(config);
	});


	let lease_id = null;
	$(".centered-table tbody").on("contextmenu", "tr", function (e) {
		e.preventDefault();
		const actionModal = $("#action-modal");
		actionModal
			.css({
				top: e.pageY + "px",
				left: e.pageX + "px",
			})
			.show();
		$(this).focus();
		lease_id = $(this).data("lease-id");
		console.log("Lease ID:", lease_id);
	});



	$(document).bind("click", function (e) {
		const actionModal = $("#action-modal");
		if (!$(e.target).closest(actionModal).length) {
			actionModal.hide();
		}
	});

	$("#delete-button").click(function () {
		const selectedRow = $('.centered-table tbody tr[data-lease-id="' + lease_id + '"]');
		const deleteModal = $("#action-modal");
		$.ajax({
			url: "/delete_lease/" + lease_id,
			type: "GET",
			success: function (data) {
				if (data.success) {
					showNotification("Lease Deleted", "error-notification");
					selectedRow.remove();
					deleteModal.hide();
					$.get("/count/leases", function (response) {
						$("#leases-count").html("Total Leases: " + response.count);
					});
				} else {
					showNotification("Failed to Delete Lease", "error-notification");
				}
			},
			error: function () {
				showNotification("Failed to Delete Lease", "error-notification");
			},
		});
	});

	$("#submit-lease-form").on("submit", function (e) {
		e.preventDefault();
		if (validateStep() && validateBrokers()) {
			$("#add-lease-modal").css("display", "none");
			var formData = new FormData(this);
			formData.append("lease-agreement-file-id", $("#lease-agreement-file-id").val());
			formData.append("lease-commission-agreement-file-id", $("#lease-commission-agreement-file-id").val());
			formData.append("lease-commission-invoice-file-id", $("#lease-commission-invoice-file-id").val());
			$.ajax({
				url: "/submit_lease",
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
						showNotification("Error Uploading Lease", "error-notification");
					}
				})
				.fail(function () {
					showNotification("Error Uploading Lease", "error-notification");
				});
		}
		else {
			showNotification("Please Fill Out All Required Fields", "error-notification");
		}
	});
});