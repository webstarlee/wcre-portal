$(window).on('load', function() {
    setTimeout(function() {
        $('#loading').hide();
    }, 2000);
});


$(document).ready(function() {
    const ownerPhoneInput = document.getElementById('listing-owner-phone');
    ownerPhoneInput.addEventListener('input', formatPhoneNumber);

    function formatPhoneNumber() {
        const phoneNumber = ownerPhoneInput.value.replace(/\D/g, '');
        const formattedPhoneNumber = formatToPhoneNumber(phoneNumber);
        ownerPhoneInput.value = formattedPhoneNumber;
    }

    function formatToPhoneNumber(phoneNumber) {
        const formattedNumber = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        return formattedNumber;
    }

    $('#add-listing-button').click(function() {
        $('#add-listing-modal').css('display', 'flex');
    });

    $('.close').click(function() {
        $('#add-listing-modal').css('display', 'none');
    });

    $('.next-step').on('click', function() {
        var currentStep = $('.active-step');
        var nextStep = currentStep.next('.modal-step');
    
        if (nextStep.length) {
            currentStep.removeClass('active-step');
            nextStep.addClass('active-step');
            $('.prev-step').css('visibility', 'visible'); /* show the previous button when not on the first step */
        }
    
        if (!nextStep.next('.modal-step').length) {
            $(this).text('Submit Listing');
        }
    });
    
    $('.prev-step').on('click', function() {
        var currentStep = $('.active-step');
        var prevStep = currentStep.prev('.modal-step');
    
        if (prevStep.length) {
            currentStep.removeClass('active-step');
            prevStep.addClass('active-step');
            $('.next-step').text('Next'); /* change the submit button back to 'next' when not on the last step */
        }
    
        if (!prevStep.prev('.modal-step').length) {
            // we are at the first step, hide the 'previous' button
            $(this).css('visibility', 'hidden');
        }
    });

    $('#add-listing-modal form').submit(function(e) {
        e.preventDefault();
        $('#add-listing-modal').css('display', 'none');
    });

    $('#search-input').on('input', function() {
        var searchTerm = $(this).val().toLowerCase();
        $('.centered-table tbody tr').each(function() {
            var listing = $(this).text().toLowerCase();
            $(this).toggle(listing.indexOf(searchTerm) > -1);
        });
    });
});