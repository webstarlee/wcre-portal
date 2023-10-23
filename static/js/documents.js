$(document).ready(function () {
  var fileInput = document.getElementById("document-file");
  var uploadButton = document.getElementById("upload-document-file");
  var editFileInput = document.getElementById("edit-document-file");
  var edituploadButton = document.getElementById("edit-upload-document-file");
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
    const modal = $(this).parents(".modal");
    modal.hide();
    resetForm(modal);
  });

  $(".document-modal").click(function () {
    $(this).css("display", "none");
    resetForm($(this));
  });

  function resetForm(modal) {
    if (modal.attr('id') === 'upload-document-modal') {
      modal.find("#submit-document-form")[0].reset();
      modal.find("#document-file-id").val("");
      modal.find("#upload-document-file").text("Upload Document File");
      modal.find("#upload-document-file").prop("disabled", false);
      modal.find(".error").removeClass("error");
      modal.find(".modal-step").removeClass("active-step");
      modal.find(".modal-step:first").addClass("active-step");
    }
    else if (modal.attr('id') === 'edit-document-modal') {
      modal.find("#edit-document-form")[0].reset();
      modal.find("#edit-document-file-id").val("");
      modal.find("#edit-upload-document-file").text("Upload Document File");
      modal.find("#edit-upload-document-file").prop("disabled", false);
      modal.find(".error").removeClass("error");
      modal.find(".modal-step").removeClass("active-step");
      modal.find(".modal-step:first").addClass("active-step");
    }
  }

  $(document).bind("click", function (e) {
    const actionModal = $("#action-modal");
    if (!$(e.target).closest(actionModal).length) {
      actionModal.hide();
    }
  });

  $(".modal-content").click(function (event) {
    event.stopPropagation();
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
        success: function (response) {
          if (response.success) {
            config.buttonElement.textContent = "Document Uploaded ✔ " + "(" + file.name + ")";
            document.getElementById(config.resultElementId).value = response["file_id"];
            config.buttonElement.disabled = false;
            document.getElementById("submit-button").disabled = false;
          } else {
            showNotification("Error Uploading Document", "error-notification");
          }
        },
        error: function () {
          showNotification("Error Uploading Document", "error-notification");
        },
      });
    });
    config.buttonElement.addEventListener("click", function (e) {
      config.inputElement.click();
    });
  }

  var configurations = [{
    inputElement: fileInput,
    buttonElement: uploadButton,
    resultElementId: "document-file-id"
  },
  {
    inputElement: editFileInput,
    buttonElement: edituploadButton,
    resultElementId: "edit-document-file-id"
  },
  ];

  configurations.forEach(function (config) {
    handleFileUpload(config);
  });

  let document_id = null;
  let document_name = null;
  $(document).ready(function () {
    var isAdmin = $("body").data("is-admin") === "True";
    $("#documentList").on("contextmenu", ".file-item", function (e) {
      e.preventDefault();
      document_id = $(this).data("document-id");
      document_name = $(this).find("p").text();
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
      console.log("Document ID:", document_id);
      console.log("Document Name:", document_name);
    });
  });

  $(document).bind("mousedown", function (e) {
    const actionModal = $("#action-modal");
    if (!$(e.target).closest(actionModal).length) {
      actionModal.hide();
    }
  });

  function getFileDetails(extensionType) {
    switch (extensionType) {
      case "pdf":
        return { iconClass: "far fa-file-pdf", extension: ".pdf" };
      case "doc":
        return { iconClass: "far fa-file-word", extension: ".doc" };
      default:
        return { iconClass: "far fa-file-alt", extension: ".txt" };
    }
  }

  function displayDocuments(documents, pageNumber) {
    documentList.innerHTML = "";
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    for (let i = startIndex; i < endIndex && i < documents.length; i++) {
      const fileDetails = getFileDetails(documents[i].document_file_id.split(".").pop());
      const li = document.createElement("li");
      li.classList = "d-flex justify-content-between align-items-center file-item";
      li.setAttribute("data-document-id", documents[i]._id);
      li.setAttribute("data-document-type", documents[i].document_type);
      const downloadButton = `<a class="download-button" href="/download/${documents[i].document_file_id}
      "download="${documents[i].document_name}${fileDetails.extension}"><i class="fa fa-download"></i></a>`;
      li.innerHTML = `
        <div class="d-flex gap-2 align-items-center">
            <i class="${fileDetails.iconClass}" style="color: #1c92d2; font-size:22px;"></i>
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

  $("#edit-button").click(function () {
    $("#action-modal").hide();
    $("#upload-document-modal").hide();
    $("#document-modal").hide();
    $("#edit-document-modal #edit-document-name").val(document_name);
    $("#edit-document-title").text(document_name);
    toggleModalDisplay("#edit-document-modal");
  });

  $("#edit-document-form").on("submit", function (e) {
    var data = {
      document_name: $("#edit-document-name").val(),
      document_file_id: $("#edit-document-file-id").val(),
    };
    $.ajax({
      url: "/edit_document/" + document_id,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(data),
      success: function (response) {
        if (response.success) {
          location.reload();
        } else {
          console.log(data.success)
          showNotification("Error Editing Document", "error-notification");
        }
      },
      error: function () {
        showNotification("Error Editing Document", "error-notification");
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
      success: function (response) {
        if (response.success) {
          location.reload();
        } else {
          showNotification("Error Uploading Document", "error-notification");
        }
      },
      error: function () {
        showNotification("Error Uploading Document", "error-notification");
      },
    });
  });


  $("#delete-button").click(function () {
    $.ajax({
      url: "/delete_document/" + document_id,
      type: "GET",
      success: function (response) {
        if (response.success) {
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