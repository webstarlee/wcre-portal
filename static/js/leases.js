$(document).ready(function() {
	var agreementFileInput = document.getElementById("lease-agreement");
	var commisionFileInput = document.getElementById("commision-agreement");
  var uploadButtonAgreement = document.getElementById("upload-lease-agreement");
  var uploadButtonCommision = document.getElementById("upload-commision-agreement");
	const leasePriceInput = document.getElementById("lease-price");
	const sqFootageInput = document.getElementById("lease-sqft");
	const lessorPhoneNumberInput = document.getElementById("lease-lessor-phone");
	const lessePhoneNumberInput = document.getElementById("lease-lesse-phone");
	const leasePercentageSpaceInput = document.getElementById("lease-percentage-space");
	leasePercentageSpaceInput.addEventListener("input", () => formatPercentage(leasePercentageSpaceInput));
	leasePriceInput.addEventListener("input", () => formatPrice(leasePriceInput));
	sqFootageInput.addEventListener("input", () => formatSqFootage(sqFootageInput));
	lessorPhoneNumberInput.addEventListener("input", () => formatPhoneNumber(lessorPhoneNumberInput));
	lessePhoneNumberInput.addEventListener("input", () => formatPhoneNumber(lessePhoneNumberInput));

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
			// Apply the background color to every third parent row
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
		//$("#edit-lease-modal").hide();
		$("#add-lease-modal").show();
		$("#add-lease-modal .prev-step").addClass("hidden");
	});

	function resetModalSteps(modal) {
		modal.find(".modal-step").removeClass("active-step");
		modal.find(".modal-step:first").addClass("active-step");
		modal.find(".prev-step").addClass("hidden");
		modal.find(".next-step").text("Next");
	}

	// CLOSE ADD LESAE MODAL
	$("#add-lease-modal .close").click(function() {
		$("body").removeClass("modal-open");
		$("#add-lease-modal").hide();
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
					$("#edit-lease-modal").css("display", "none");
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

		if (prevStep.length) {
			currentStep.removeClass("active-step");
			prevStep.addClass("active-step");

			if (!prevStep.prev(".modal-step").length) {
				$(this).addClass("hidden");
			}

			if (currentModal.data("mode") === "add") {
				currentStep
					.find("input:required, select:required")
					.removeClass("error");
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
				} else {
					showNotification("Failed to Delete Lease", "error-notification");
				}
			},
			error: function() {
				showNotification("Failed to Delete Lease", "error-notification");
			},
		});
	});

  uploadButtonAgreement.addEventListener("click", function(e) {
		agreementFileInput.click();
	});

  uploadButtonCommision.addEventListener("click", function(e) {
		commisionFileInput.click();
	});

  $(".modal-content").click(function(event) {
		event.stopPropagation();
	});

	agreementFileInput.addEventListener("change", function(e) {
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
					uploadButtonAgreement.textContent = "Document Uploaded ✔";
					uploadButtonAgreement.disabled = true;
					document.getElementById("lease-agreement-file-base64").value =
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

	commisionFileInput.addEventListener("change", function(e) {
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
					uploadButtonCommision.textContent = "Document Uploaded ✔";
					uploadButtonCommision.disabled = true;
					document.getElementById("commision-agreement-file-base64").value =
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

	// PREV STEP
	$(".prev-step").on("click", function() {
		var currentModal = $(this).closest(".lease-modal");
		var currentStep = currentModal.find(".active-step");
		var prevStep = currentStep.prev(".modal-step");

		if (prevStep.length) {
			currentStep.removeClass("active-step");
			prevStep.addClass("active-step");

			if (!prevStep.prev(".modal-step").length) {
				$(this).addClass("hidden");
			}

			if (currentModal.data("mode") === "add") {
				currentStep
					.find("input:required, select:required")
					.removeClass("error");
			}
		}
	});
});