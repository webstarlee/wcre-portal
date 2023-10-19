$(document).ready(function () {
    updateNotifications();
    function updateNotifications() {
        $.ajax({
            url: '/api/get_notifications',
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                let notificationsList = $('.list-group');
                notificationsList.empty();
                if (data.success && Array.isArray(data.notifications)) {
                    data.notifications.forEach(function (notification) {
                        let listItem = `
                        <li class="list-group-item d-flex align-items-center">
                            <i class="fas ${notification.icon} me-3" style="color: ${notification.color};"></i>
                            ${notification.text}
                        </li>`;
                        notificationsList.append(listItem);
                    });
                }
            }
        });
    }
});
