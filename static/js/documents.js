$(document).ready(function() {
	var fileInput = document.getElementById("document-file");
	var uploadButton = document.getElementById("upload-document-file");

	// SHOW ERROR NOTI
	function showErrorNotification(message) {
		var errorNotification = $("#error-notification");
		errorNotification.text(message);
		errorNotification.addClass("show");

		setTimeout(function() {
			errorNotification.removeClass("show");
		}, 2000);
	}

	function showSuccessNotification(message) {
		var successNotification = $("#success-notification");
		successNotification.text(message);
		successNotification.addClass("show");

		setTimeout(function() {
			successNotification.removeClass("show");
		}, 2000);
	}

	// SHOW SUCCESS NOTI - MODAL
	function showSuccessNotificationModal(message) {
		var successNotification = $("#success-notification-modal");
		successNotification.text(message);
		successNotification.addClass("show");

		setTimeout(function() {
			successNotification.removeClass("show");
		}, 2000);
	}

	// SHOW ERROR NOTI - MODAL
	function showErrorNotificationModal(message) {
		var errorNotification = $("#error-notification-modal");
		errorNotification.text(message);
		errorNotification.addClass("show");

		setTimeout(function() {
			errorNotification.removeClass("show");
		}, 2000);
	}

	// OPEN MODAL
	$("#upload-document-button").on("click", function() {
		$("body").addClass("modal-open");
		$("#upload-document-modal").css("display", "flex");
	});
	// CLOSE MODAL
	$(".close").click(function(e) {
		e.stopPropagation(); // Stop event bubbling up and closing the modal
		$(this).parents(".modal").hide();
		resetForm();
	});

	$(".modal").click(function() {
		$(this).css("display", "none");
		resetForm();
	});

	$(document).bind("click", function(e) {
		const actionModal = $("#action-modal");
		if (!$(e.target).closest(actionModal).length) {
			actionModal.hide();
		}
	});

	function resetForm() {
		$("#submit-document-form")[0].reset();
		$("#document-file-base64").val("");
		$("#upload-document-file").text("Upload Document File");
		$("#upload-document-file").prop("disabled", false);
		$(".error").removeClass("error");
		$(".modal-step").removeClass("active-step");
		$(".modal-step:first").addClass("active-step");
	}

	uploadButton.addEventListener("click", function(e) {
		fileInput.click();
	});

	$(".modal-content").click(function(event) {
		event.stopPropagation();
	});

	// Handle document file button click
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
					showSuccessNotificationModal("Document Uploaded Successfully");
					uploadButton.disabled = true;
					document.getElementById("document-file-base64").value =
						data.fileBase64;
				} else {
					showErrorNotificationModal("Error Uploading Document");
				}
			},
			error: function() {
				showErrorNotificationModal("Error Uploading Document");
			},
		});
	});

	// Handle Form Submission
	$("#submit-document-form").on("submit", function(e) {
		if ($("#document-file")[0].files.length === 0) {
			e.preventDefault();
			showErrorNotificationModal("Please Upload a PDF File");
			return;
		}

		e.preventDefault();
		$("#upload-document-modal").css("display", "none");
		var formData = new FormData(this);
		var fileBase64 = $("#document-file-base64").val();
		formData.append("fileBase64", fileBase64);

		$.ajax({
				url: "/submit_document",
				type: "POST",
				data: formData,
				processData: false,
				contentType: false,
				dataType: "json",
			})
			.done(function(response, jqXHR) {
				if (response.status === "success") {
					console.log("Document Uploaded Successfully");
					window.location.href = response.redirect;
				} else {
					showErrorNotification("Unexpected Status Code: " + jqXHR.status);
					console.log("Unexpected Status Code: " + jqXHR.status);
				}
			})
			.fail(function(textStatus, errorThrown) {
				showErrorNotification("Error Uploading Document");
				console.log("Error Uploading Document: ", textStatus, errorThrown);
			});
	});

	const documentList = document.getElementById("documentList");
	const emptyMessage = document.getElementById("empty-message");
	const pagination = document.getElementById("pagination");
	const itemsPerPage = 10;

	function displayDocuments(documents, pageNumber) {
		documentList.innerHTML = "";

		const startIndex = (pageNumber - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;

		for (let i = startIndex; i < endIndex && i < documents.length; i++) {
			const li = document.createElement("li");
			li.classList = "d-flex justify-content-between align-items-center";
			var downloadButton =
				'<a class="download-button" href="data:application/pdf;base64,' +
				documents[i].pdf_file_base64 +
				'" download="' +
				documents[i].document_name +
				'.pdf"><i class="fa fa-download"></i></a>';
			li.innerHTML = `
                  <div class="d-flex gap-2 align-items-center">
                    <i class="far fa-file-pdf text-dark" style="color: #1c92d2; font-size:22px;"></i>
                    <p class="mb-0">${documents[i].document_name}</p>
                  </div>
                  <span>${downloadButton}</span>`;
			documentList.appendChild(li);
		}
	}
	$(".card-footer").on("click", function(e) {
		e.preventDefault();

		var documentType = $(this)
			.closest(".card-body")
			.find("#text-container")
			.find("#card-title")
			.text();
		$.get(
			"get_documents", {
				document_type: documentType,
			},
			function(data) {
				$("#document-modal .modal-title").text(
					"Documents Files - " + documentType
				);
				var modal = document.getElementById("document-modal");
				modal.style.display = "block";

				const documents = data;

				if (documents.length === 0) {
					pagination.innerHTML = "";
					documentList.innerHTML = "";
					emptyMessage.classList = "";
					emptyMessage.classList = "d-block mt-3";
				} else {
					emptyMessage.classList = "";
					emptyMessage.classList = "d-none";

					const totalPages = Math.ceil(documents.length / itemsPerPage);

					displayDocuments(documents, 1);

					function createPaginationButtons(totalPages, currentPage) {
						pagination.innerHTML = "";

						if (totalPages <= 7) {
							for (let i = 1; i <= totalPages; i++) {
								createPaginationButton(i, currentPage);
							}
						} else {
							for (let i = 1; i <= 2; i++) {
								createPaginationButton(i, currentPage);
							}

							const ellipsisBefore = document.createElement("span");
							ellipsisBefore.textContent = "...";
							pagination.appendChild(ellipsisBefore);

							for (let i = currentPage - 1; i <= currentPage + 1; i++) {
								if (i > 2 && i < totalPages - 1) {
									createPaginationButton(i, currentPage);
								}
							}
							const ellipsisAfter = document.createElement("span");
							ellipsisAfter.textContent = "...";
							pagination.appendChild(ellipsisAfter);

							for (let i = totalPages - 1; i <= totalPages; i++) {
								createPaginationButton(i, currentPage);
							}
						}
					}

					createPaginationButtons(totalPages, 1);

					function createPaginationButton(pageNumber, currentPage) {
						const button = document.createElement("button");
						button.textContent = pageNumber;
						button.classList = "page-item border-0";
						if (pageNumber === currentPage) {
							button.classList.add("active");
						}
						button.addEventListener("click", () => {
							createPaginationButtons(totalPages, pageNumber);
							displayDocuments(documents, pageNumber);
						});
						pagination.appendChild(button);
					}
				}
			}
		);
	});
});