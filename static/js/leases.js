$(document).ready(function () {
	var agreementFileInput = document.getElementById("lease-agreement");
	var uploadButtonAgreement = document.getElementById("upload-lease-agreement");
	var editAgreementFileInput = document.getElementById("edit-lease-agreement");
	var editUploadButtonAgreement = document.getElementById("edit-upload-lease-agreement");
	var commissionFileInput = document.getElementById("lease-commission-agreement");
	var uploadButtoncommission = document.getElementById("upload-lease-commission-agreement");
	var editcommissionFileInput = document.getElementById("edit-lease-commission-agreement");
	var editUploadButtoncommission = document.getElementById("edit-upload-lease-commission-agreement");
	const sqFootageInput = document.getElementById("lease-sqft");
	const editsqFootageInput = document.getElementById("edit-lease-sqft");
	const lessorPhoneNumberInput = document.getElementById("lease-lessor-phone");
	const lesseePhoneNumberInput = document.getElementById("lease-lessee-phone");
	sqFootageInput.addEventListener("input", () => formatSqFootage(sqFootageInput));
	lessorPhoneNumberInput.addEventListener("input", () => formatPhoneNumber(lessorPhoneNumberInput));
	lesseePhoneNumberInput.addEventListener("input", () => formatPhoneNumber(lesseePhoneNumberInput));
	editsqFootageInput.addEventListener("input", () => formatSqFootage(editsqFootageInput));
	document.getElementById('years').addEventListener('change', adjustTerm);
	document.getElementById('months').addEventListener('change', adjustTerm);

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
		var $brokerInput = $("#lease-brokers");
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

	$(document).ready(function () {
		const iconVisible = $(".fa-caret-right");
		const iconHidden = $(".fa-caret-down");
		iconHidden.hide();
		$(".centered-table tbody tr[data-lease-id] button").click(function () {
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

	$(document).ready(function () {
		$(".parent-row").each(function (index) {
			if (index % 3 === 0) {
				$(this).addClass("selected-parent");
			} else {
				$(this).addClass("selected-child");
			}
		});
	});

	// OPEN ADD LEASES MODAL
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
		setInputValue("#edit-lease-sqft", getCellText(2));
		setInputValue("#edit-lease-term-length", getCellText(3));
		setInputValue("#edit-lease-street", getCellText(4));
		setInputValue("#edit-lease-city", getCellText(5));
		setInputValue("#edit-lease-state", getCellText(6));
		setInputValue("#edit-lease-lessor-name", getNameFromCell(7));
		setInputValue("#edit-lease-lessor-email", getEmailFromCell(7));
		setInputValue("#edit-lease-lessor-phone", getPhoneFromCell(7));
		setInputValue("#edit-lease-lessee-name", getNameFromCell(8));
		setInputValue("#edit-lease-lessee-email", getEmailFromCell(8));
		setInputValue("#edit-lease-lessee-phone", getPhoneFromCell(8));
	});


	// CLOSE ADD LESAE MODAL
	$("#add-lease-modal .close").click(function () {
		$("body").removeClass("modal-open");
		$("#add-lease-modal").hide();
	});

	// CLOSE EDIT LEASE MODAL
	$("#edit-lease-modal .close").click(function () {
		$("body").removeClass("modal-open");
		$("#edit-lease-modal").hide();
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
				<a href="mailto:${result.lease_lessor_email}">${result.lease_lessor_name}</a>
				<a href="tel:${result.lease_lessor_phone}">${result.lease_lessor_phone}</a>
			 </div>`,
			`<div class="contact-info">
				<a href="mailto:${result.lease_lessee_email}">${result.lease_lessee_name}</a>
				<a href="tel:${result.lease_lessee_phone}">${result.lease_lessee_phone}</a>
			 </div>`
		];
		cells.forEach(cell => $row.append($("<td>").html(cell)));
		const brokerElements = $.map(result.brokers, broker => $("<span>").addClass("broker-name").text(broker));
		$row.append($("<td>").addClass("brokers").append(brokerElements));
		$row.append($("<td>").html(result.lease_agreement_file_base64 ? `<form method="POST"><a href="/download_lease_agreement_pdf/${result._id}">Fully Executed</a></form>` : "Pending"));
		$row.append($("<td>").html(result.lease_commission_file_base64 ? `<form method="POST"><a href="/download_lease_commission_pdf/${result._id}">Fully Executed</a></form>` : "Pending"));
		return $row;
	};


	const handleSearchError = (textStatus, errorThrown) => {
		console.error("Error Fetching Lease Results:", textStatus, errorThrown);
		showNotification("Error Fetching Lease Results", "error-notification");
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

	$(".modal-content").click(function (event) {
		event.stopPropagation();
	});

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
					var leaseSqFt = $("#edit-lease-sqft").val();
					var leaseTermLength = $("#edit-lease-term-length").val();
					var leaseStreet = $("#edit-lease-street").val();
					var leaseCity = $("#edit-lease-city").val();
					var leaseState = $("#edit-lease-state").val();
					var leaseLessor = $("#edit-lease-lessor-name").val();
					var leaseLessorEmail = $("#edit-lease-lessor-email").val();
					var leaseLessorPhone = $("#edit-lease-lessor-phone").val();
					var leaselessee = $("#edit-lease-lessee-name").val();
					var leaselesseeEmail = $("#edit-lease-lessee-email").val();
					var leaselesseePhone = $("#edit-lease-lessee-phone").val();
					var agreementFileBase64 = $("#edit-lease-agreement-file-base64").val();
					var commissionFileBase64 = $("#edit-lease-commission-agreement-file-base64").val();

					var data = {
						lease_property_type: leasePropertyType,
						lease_sqft: leaseSqFt,
						lease_term_length: leaseTermLength,
						lease_agreement_file_base64: agreementFileBase64,
						lease_commission_file_base64: commissionFileBase64,
						lease_street: leaseStreet,
						lease_city: leaseCity,
						lease_state: leaseState,
						lease_lessor_name: leaseLessor,
						lease_lessor_email: leaseLessorEmail,
						lease_lessor_phone: leaseLessorPhone,
						lease_lessee_name: leaselessee,
						lease_lessee_email: leaselesseeEmail,
						lease_lessee_phone: leaselesseePhone
					};

					$.ajax({
						url: "/edit_lease/" + lease_id,
						type: "POST",
						contentType: "application/json",
						data: JSON.stringify(data),
						success: function (response) {
							if (response.success) {
								location.reload();
							} else {
								showNotification("Error Editing lease", "error-notification");
							}
						},
						error: function () {
							showErrorNotificationModal("Error Editing lease");
						},
					});
				} else {
					showNotification(
						"Please Fill Out All Required Fields",
						"error-notification"
					);
				}
			}
		} else {
			showNotification(
				"Please Fill Out All Required Fields",
				"error-notification"
			);
		}
	});

	// PREV STEP
	$(".prev-step").on("click", function () {
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

	function handleFileUpload(config) {
		config.inputElement.addEventListener("change", function (e) {
			var file = this.files[0];
			var formData = new FormData();
			formData.append("file", file);

			$.ajax({
				url: "/upload_pdf",
				type: "POST",
				data: formData,
				processData: false,
				contentType: false,
				success: function (data) {
					if (data.success) {
						config.buttonElement.textContent = "Document Uploaded ✔";
						config.buttonElement.disabled = true;
						document.getElementById(config.resultElementId).value = data.fileBase64;
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
		resultElementId: "lease-agreement-file-base64"
	},
	{
		inputElement: editAgreementFileInput,
		buttonElement: editUploadButtonAgreement,
		resultElementId: "edit-lease-agreement-file-base64"
	},
	{
		inputElement: commissionFileInput,
		buttonElement: uploadButtoncommission,
		resultElementId: "lease-commission-agreement-file-base64"
	},
	{
		inputElement: editcommissionFileInput,
		buttonElement: editUploadButtoncommission,
		resultElementId: "edit-lease-commission-agreement-file-base64"
	}
	];

	configurations.forEach(function (config) {
		handleFileUpload(config);
	});


	// OPEN ACTION MODAL
	var isAdmin = $("body").data("is-admin") === "True";
	$(".centered-table tbody tr").on("contextmenu", function (e) {
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

		lease_id = $(this).data("lease-id");
		console.log("Lease ID:", lease_id);
	});

	$(document).bind("click", function (e) {
		const actionModal = $("#action-modal");
		if (!$(e.target).closest(actionModal).length) {
			actionModal.hide();
		}
	});

	let lease_id = null;
	$(".centered-table tbody tr").on("contextmenu", function (e) {
		e.preventDefault();
		lease_id = $(this).data("lease-id");
		console.log("Lease ID:", lease_id);
	});

	$("#delete-button").click(function () {
		const selectedRow = $(
			'.centered-table tbody tr[data-lease-id="' + lease_id + '"]'
		);
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

	// SUBMIT LEASE
	$("#submit-lease-form").on("submit", function (e) {
		e.preventDefault();
		$("#add-lease-modal").css("display", "none");
		if (validateStep() && validateBrokers()) {
			var formData = new FormData(this);
			var leaseAgreementFileBase64 = $("#lease-agreement-file-base64").val();
			var commissionAgreementFileBase64 = $("#lease-commission-agreement-file-base64").val();
			formData.append("lease-agreement-file-base64", leaseAgreementFileBase64);
			formData.append("lease-commission-agreement-file-base64", commissionAgreementFileBase64);
			$.ajax({
				url: "/submit_lease",
				type: "POST",
				data: formData,
				processData: false,
				contentType: false,
				dataType: "json",
			})
				.done(function (response) {
					if (response.status === "success") {
						window.location.href = response.redirect;
					} else {
						showNotification("Error Uploading Lease", "error-notification");
					}
				})
				.fail(function () {
					showNotification("Error Uploading Lease", "error-notification");
				});
		}
	});
});