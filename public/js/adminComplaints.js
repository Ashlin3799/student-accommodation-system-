const complaintsBody =
    document.getElementById("complaintsBody");

const complaintMessage =
    document.getElementById("complaintMessage");

const refreshButton =
    document.getElementById("refreshButton");

const logoutButton =
    document.getElementById("logoutButton");

const adminName =
    document.getElementById("adminName");


// ----------------------------------------------------
// Check admin login
// ----------------------------------------------------

const token =
    localStorage.getItem("token");

const userData =
    localStorage.getItem("user");


if (!token || !userData) {

    window.location.href = "/";

}


try {

    const user =
        JSON.parse(userData);


    if (user.role !== "admin") {

        window.location.href =
            "/student/dashboard.html";

    }


    if (user.name) {

        adminName.textContent =
            user.name;

    }

}
catch (error) {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href = "/";

}



// ----------------------------------------------------
// Load all complaints
// ----------------------------------------------------

async function loadComplaints() {

    complaintMessage.textContent =
        "Loading complaints...";

    complaintsBody.innerHTML = "";


    try {

        const response =
            await fetch("/api/complaints");


        const result =
            await response.json();


        if (!response.ok) {

            complaintMessage.textContent =
                result.message ||
                "Unable to load complaints.";

            return;

        }


        displayComplaints(result.data);

    }
    catch (error) {

        console.error(error);

        complaintMessage.textContent =
            "Unable to connect to the server.";

    }

}



// ----------------------------------------------------
// Display complaints
// ----------------------------------------------------

function displayComplaints(complaints) {

    complaintsBody.innerHTML = "";


    if (!complaints || complaints.length === 0) {

        complaintMessage.textContent =
            "No complaints have been submitted.";

        return;

    }


    complaintMessage.textContent =
        `${complaints.length} complaint(s) found.`;


    complaints.forEach((complaint) => {

        const row =
            document.createElement("tr");


        const date =
            new Date(
                complaint.createdAt
            ).toLocaleString();


        row.innerHTML = `

            <td>
                ${escapeHtml(complaint.studentId)}
            </td>

            <td>
                ${escapeHtml(complaint.studentName)}
            </td>

            <td class="description-cell">
                ${escapeHtml(complaint.description)}
            </td>

            <td>

                <span
                    class="status ${getStatusClass(complaint.status)}"
                >

                    ${escapeHtml(complaint.status)}

                </span>

            </td>

            <td>
                ${escapeHtml(date)}
            </td>

        `;


        complaintsBody.appendChild(row);

    });

}



// ----------------------------------------------------
// Complaint status CSS
// ----------------------------------------------------

function getStatusClass(status) {

    if (status === "Resolved") {

        return "status-resolved";

    }


    if (status === "In Progress") {

        return "status-progress";

    }


    return "status-pending";

}



// ----------------------------------------------------
// Escape HTML
// ----------------------------------------------------

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value ?? "");

    return div.innerHTML;

}



// ----------------------------------------------------
// Refresh button
// ----------------------------------------------------

refreshButton.addEventListener(
    "click",
    loadComplaints
);



// ----------------------------------------------------
// Logout
// ----------------------------------------------------

logoutButton.addEventListener(
    "click",
    function () {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        window.location.href = "/";

    }
);



// ----------------------------------------------------
// Load when page opens
// ----------------------------------------------------

loadComplaints();