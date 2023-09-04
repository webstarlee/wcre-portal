$(document).ready(function() {
	const leasePriceInput = document.getElementById("lease-price");
	const sqFootageInput = document.getElementById("lease-sqft");
	const lessorPhoneNumberInput = document.getElementById("lease-lessor-phone");
	const lessePhoneNumberInput = document.getElementById("lease-lesse-phone");
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
	$("#lease-start-date").datepicker();
	$("#lease-end-date").datepicker();
});

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

// OPEN MODAL
$("#add-lease-button").click(function() {
	$("body").addClass("modal-open");
	$("#edit-lease-modal").hide();
	$("#add-lease-modal").show();
}); $(".add-lease-modal").click(function(e) {
	if (
		$(e.target).hasClass("add-lease-modal") ||
		$(e.target).hasClass("close")
	) {
		$("body").removeClass("modal-open");
		$("#add-lease-modal").hide();
	}
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

function validateDates() {
	var startDateInput = $("#lease-start-date");
	var isValid = startDateInput.val().trim().length > 0;
	console.log(isValid);

	if (!isValid) {
		$("#lease-start-date").addClass("error");
	} else {
		$("#lease-start-date").removeClass("error");
	}
	return isValid;
}


// NEXT STEP
$(".next-step").on("click", function() {
	var currentStep = $(".active-step");
	var nextStep = currentStep.next(".modal-step.main-form-step");

	if (nextStep.length) {
		if (validateStep()) {
			currentStep.removeClass("active-step");
			nextStep.addClass("active-step");
			$(".prev-step").css("visibility", "visible");

			if (!nextStep.next(".modal-step").length) {
				$(this).text("Submit Lease");
			} else {
				$(this).text("Next");
			}
		} else {
			showNotification("Please Fill Out All Required Fields", "error-notification-modal");
		}
	} else {
		if (validateBrokers()) {
			$("#submit-lease-form").submit();
		} else {
			showNotification("Please Fill Out All Required Fields", "error-notification-modal");
		}
	}
});

// PREV STEP
$(".prev-step").on("click", function() {
	var currentStep = $(".active-step");
	var prevStep = currentStep.prev(".modal-step");

	if (prevStep.length) {
		currentStep.removeClass("active-step");
		prevStep.addClass("active-step");
		$(".next-step").text("Next");
	}

	if (!prevStep.prev(".modal-step").length) {
		$(this).css("visibility", "hidden");
	}
	currentStep.find("input:required, select:required").removeClass("error");
});
});