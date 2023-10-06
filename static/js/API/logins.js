document.addEventListener("DOMContentLoaded", function () {
    fetch('/api/logins')
        .then(response => response.json())
        .then(data => {
            displayUserLogins(data);
            displayRecentLogins(data);
        })
        .catch(error => console.error('Error Fetching Data:', error));
});

function displayUserLogins(data) {
    const userData = groupBy(data, 'username');
    const userTable = document.getElementById('userTable');
    userTable.innerHTML = '';
    const headerRow = userTable.insertRow();
    const usernameHeader = headerRow.insertCell();
    usernameHeader.innerText = 'Username';
    const totalLoginsHeader = headerRow.insertCell();
    totalLoginsHeader.innerText = 'Total Logins';
    const recentLoginHeader = headerRow.insertCell();
    recentLoginHeader.innerText = 'Most Recent Login';

    for (let username in userData) {
        const user = userData[username];
        const row = userTable.insertRow();
        const usernameCell = row.insertCell();
        usernameCell.innerText = username;
        const totalLoginsCell = row.insertCell();
        totalLoginsCell.innerText = user.length; // Total logins
        const recentLoginCell = row.insertCell();
        recentLoginCell.innerText = getMostRecentLogin(user); // Most recent login
    }
}

function groupBy(array, key) {
    return array.reduce((result, currentItem) => {
        (result[currentItem[key]] = result[currentItem[key]] || []).push(currentItem);
        return result;
    }, {});
}

function getMostRecentLogin(userLogins) {
    const sortedLogins = userLogins.sort((a, b) => new Date(b.login_time) - new Date(a.login_time));
    return sortedLogins[0].login_time;
}

function displayRecentLogins(data) {
    const sortedLogins = data.sort((a, b) => new Date(b.login_time) - new Date(a.login_time));
    const recentLoginsTable = document.getElementById('recentLoginsTable');
    const tbody = recentLoginsTable.querySelector('tbody');
    tbody.innerHTML = '';
    const maxRecentLogins = 10;
    for (let i = 0; i < Math.min(maxRecentLogins, sortedLogins.length); i++) {
        const login = sortedLogins[i];
        const row = tbody.insertRow();
        const userCell = row.insertCell();
        userCell.innerText = login.username;
        const loginTimeCell = row.insertCell();
        loginTimeCell.innerText = login.login_time;
    }
}
