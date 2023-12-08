$(document).ready(function () {
    function populateLogs(logData) {
        var logsList = $('.logs-list');
        var noLogsMessage = $('.no-logs-message');
        var recentLogs = logData.log_entries.slice(0, 10);
        if (recentLogs.length == []) {
            noLogsMessage.show();
        } else {
            noLogsMessage.hide();
            $.each(recentLogs, function (index, logEntry) {
                var logItem = $('<div class="log-item"></div>');
                var logParts = logEntry.log_entry.split(' ', 4);
                if (logParts.length >= 4) {
                    var timestamp = logParts[0] + ' ' + logParts[1] + ' ';
                    var statusAndMessage = logEntry.log_entry.substr(logParts[0].length + logParts[1].length + logParts[2].length + 3);
                    logItem.text(timestamp + ' - ' + statusAndMessage);
                    logsList.append(logItem);
                }
            });
        }
    }
    $.ajax({
        url: '/api/fetch_logs',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            populateLogs(data);
        },
        error: function () {
            console.error('Error fetching log data.');
        }
    });
});