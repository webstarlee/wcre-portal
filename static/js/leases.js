$(document).ready(function () {
  $(function () {
    $("#lease-start-date").datepicker();
    $("#lease-end-date").datepicker();
  });

  // OPEN MODAL
  $("#add-lease-button").click(function () {
    $("body").addClass("modal-open");
    $("#edit-lease-modal").hide();
    $("#add-lease-modal").show();
  });
  $(".add-lease-modal").click(function (e) {
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

    inputs.each(function () {
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

  // SHOW ERROR NOTI
  function showErrorNotification(message) {
    var errorNotification = $("#error-notification");
    errorNotification.text(message);
    errorNotification.addClass("show");

    setTimeout(function () {
      errorNotification.removeClass("show");
    }, 2000);
  }

  function showSuccessNotification(message) {
    var successNotification = $("#success-notification");
    successNotification.text(message);
    successNotification.addClass("show");

    setTimeout(function () {
      successNotification.removeClass("show");
    }, 2000);
  }

  // SHOW SUCCESS NOTI - MODAL
  function showSuccessNotificationModal(message) {
    var successNotification = $("#success-notification-modal");
    successNotification.text(message);
    successNotification.addClass("show");

    setTimeout(function () {
      successNotification.removeClass("show");
    }, 2000);
  }

  // SHOW ERROR NOTI - MODAL
  function showErrorNotificationModal(message) {
    var errorNotification = $("#error-notification-modal");
    errorNotification.text(message);
    errorNotification.addClass("show");

    setTimeout(function () {
      errorNotification.removeClass("show");
    }, 2000);
  }

  // NEXT STEP
  $(".next-step").on("click", function () {
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
        showErrorNotificationModal("Please Fill Out All Required Fields");
      }
    } else {
      if (validateBrokers()) {
        $("#submit-lease-form").submit();
      } else {
        showErrorNotificationModal("Please Fill Out All Required Fields");
      }
    }
  });

  // PREV STEP
  $(".prev-step").on("click", function () {
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
