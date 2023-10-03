$(document).ready(function () {
  var fileInput = document.getElementById("document-file");
  var uploadButton = document.getElementById("upload-document-file");
  const documentList = document.getElementById("documentList");
  const emptyMessage = document.getElementById("empty-message");
  const pagination = document.getElementById("pagination");
  const itemsPerPage = 10;

  function showNotification(message, elementId) {
    var notification = $("#" + elementId);
    notification.text(message);
    notification.addClass("show");
    setTimeout(function () {
      notification.removeClass("show");
    }, 2000);
  }

  function toggleModalDisplay(modalId) {
    const modal = $(modalId);
    const isHidden = modal.css("display") === "none";

    if (isHidden) {
      $("body").addClass("modal-open");
      modal.css("display", "flex");
    } else {
      modal.css("display", "none");
    }
  }

  $("#upload-document-sm-button").on("click", function () {
    toggleModalDisplay("#upload-document-modal");
  });

  $("#upload-document-button").on("click", function () {
    toggleModalDisplay("#upload-document-modal");
  });

  $(".close").click(function (e) {
    e.stopPropagation();
    $(this).parents(".modal").hide();
    resetForm();
  });

  $(".modal").click(function () {
    $(this).css("display", "none");
    resetForm();
  });

  $(document).bind("click", function (e) {
    const actionModal = $("#action-modal");
    if (!$(e.target).closest(actionModal).length) {
      actionModal.hide();
    }
  });

  function resetForm() {
    $("#submit-document-form")[0].reset();
    $("#document-file-id").val("");
    $("#upload-document-file").text("Upload Document File");
    $("#upload-document-file").prop("disabled", false);
    $(".error").removeClass("error");
    $(".modal-step").removeClass("active-step");
    $(".modal-step:first").addClass("active-step");
  }

  uploadButton.addEventListener("click", function (e) {
    fileInput.click();
  });

  $(".modal-content").click(function (event) {
    event.stopPropagation();
  });

  fileInput.addEventListener("change", function (e) {
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
        console.log(data);
        if (data.success) {
          uploadButton.textContent = "Document Uploaded ✔";
          uploadButton.disabled = true;
          document.getElementById("document-file-id").value = data["fileId"];
        } else {
          showNotification("Error Uploading Document", "error-notification");
        }
      },
      error: function () {
        showNotification("Error Uploading Document", "error-notification");
      },
    });
  });


  $("#submit-document-form").on("submit", function (e) {
    if ($("#document-file")[0].files.length === 0) {
      e.preventDefault();
      showNotification("Please Upload a PDF File", "error-notification");
      return;
    }

    e.preventDefault();
    var formData = new FormData(this);
    formData.append("document-file-id", $("#document-file-id").val());

    $.ajax({
      url: "/submit_document",
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
          showNotification("Error Uploading Document", "error-notification");
        }
      })
      .fail(function (textStatus, errorThrown) {
        showNotification("Error Uploading Document", "error-notification");
        console.log("Error Uploading Document: ", textStatus, errorThrown);
      });
  });

  let document_id = null;
  $(document).ready(function () {
    var isAdmin = $("body").data("is-admin") === "True";
    $("#documentList").on("contextmenu", ".file-item", function (e) {
      e.preventDefault();
      document_id = $(this).data("document-id");
      console.log("Document ID:", document_id);

      console.log(isAdmin);
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
    });
  });

  $(document).bind("mousedown", function (e) {
    const actionModal = $("#action-modal");
    if (!$(e.target).closest(actionModal).length) {
      actionModal.hide();
    }
  });

  function displayDocuments(documents, pageNumber) {
    documentList.innerHTML = "";
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    for (let i = startIndex; i < endIndex && i < documents.length; i++) {
      const li = document.createElement("li");
      li.classList = "d-flex justify-content-between align-items-center file-item";
      li.setAttribute("data-document-id", documents[i]._id);
      li.setAttribute("data-document-type", documents[i].document_type);
      var downloadButton = '<a class="download-button" href="/download/' + documents[i].document_file_id +
        '" download="' + documents[i].document_name + '.pdf"><i class="fa fa-download"></i></a>';
      li.innerHTML = `
                <div class="d-flex gap-2 align-items-center">
                    <i class="far fa-file-pdf text-dark" style="color: #1c92d2; font-size:22px;"></i>
                    <p class="mb-0">${documents[i].document_name}</p>
                </div>
                <span>${downloadButton}</span>`;
      documentList.appendChild(li);
    }
  }

  let allDocuments = [];
  let documentsPromise = $.ajax({
    url: "get_documents",
    method: "GET"
  });

  documentsPromise.done(function (data) {
    allDocuments = data;
  });

  $(".card-footer").on("click", function (e) {
    e.preventDefault();
    var documentType = $(this).closest(".card-body").find("#text-container").find("#card-title").text();
    const filteredDocuments = allDocuments.filter(doc => doc.document_type === documentType);
    $("#document-modal .modal-title").text("Documents - " + documentType);
    var modal = document.getElementById("document-modal");
    modal.style.display = "block";
    const documents = filteredDocuments;
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
  });

  $("#delete-button").click(function () {
    $.ajax({
      url: "/delete_document/" + document_id,
      type: "GET",
      success: function (data) {
        if (data.success) {
          location.reload();
        } else {
          showNotification("Error Deleting Document", "error-notification");
        }
      },
      error: function () {
        showNotification("Error Deleting Document", "error-notification");
      },
    });
  });
});