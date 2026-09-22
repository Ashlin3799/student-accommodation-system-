const complaintsBody =
    document.getElementById('complaintsBody');

const complaintMessage =
    document.getElementById('complaintMessage');

const refreshButton =
    document.getElementById('refreshButton');

const logoutButton =
    document.getElementById('logoutButton');

const adminName =
    document.getElementById('adminName');


// ----------------------------------------------------
// CHECK ADMIN LOGIN
// ----------------------------------------------------

const token =
    localStorage.getItem('token');

const userData =
    localStorage.getItem('user');


if (!token || !userData) {

    window.location.href = '/';

}
else {

    try {

        const user =
            JSON.parse(userData);


        if (user.role !== 'admin') {

            window.location.href =
                '/student/dashboard.html';

        }
        else if (user.name) {

            adminName.textContent =
                user.name;

        }

    }
    catch (error) {

        localStorage.removeItem('token');

        localStorage.removeItem('user');

        window.location.href = '/';

    }

}



// ----------------------------------------------------
// LOAD ALL COMPLAINTS
// ----------------------------------------------------

async function loadComplaints() {

    complaintMessage.textContent =
        'Loading complaints...';

    complaintsBody.innerHTML =
        '';


    try {

        const response =
            await fetch('/api/complaints');


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                'Unable to load complaints.'
            );

        }


        displayComplaints(
            result.data
        );

    }

    catch (error) {

        console.error(
            'Complaint loading error:',
            error
        );


        complaintMessage.textContent =
            error.message;


        complaintsBody.innerHTML =
            '';

    }

}



// ----------------------------------------------------
// DISPLAY COMPLAINTS
// ----------------------------------------------------

function displayComplaints(complaints) {

    complaintsBody.innerHTML =
        '';


    if (
        !Array.isArray(complaints) ||
        complaints.length === 0
    ) {

        complaintMessage.textContent =
            'No complaints have been submitted yet.';

        return;

    }


    complaintMessage.textContent =
        `${complaints.length} complaint${
            complaints.length === 1
                ? ''
                : 's'
        } found.`;



    complaints.forEach(
        (complaint) => {


            const row =
                document.createElement('tr');


            const status =
                complaint.status ||
                'Pending';


            let submittedDate =
                'N/A';


            if (complaint.createdAt) {

                const date =
                    new Date(
                        complaint.createdAt
                    );


                if (
                    !Number.isNaN(
                        date.getTime()
                    )
                ) {

                    submittedDate =
                        date.toLocaleString();

                }

            }



            row.innerHTML = `

                <td>

                    ${escapeHtml(
                        complaint.studentId
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        complaint.studentName
                    )}

                </td>


                <td class="description-cell">

                    ${escapeHtml(
                        complaint.description
                    )}

                </td>


                <td>

                    <span
                        class="status ${getStatusClass(status)}"
                    >

                        ${escapeHtml(status)}

                    </span>

                </td>


                <td>

                    ${escapeHtml(
                        submittedDate
                    )}

                </td>


                <td>

                    <select
                        id="status-${complaint._id}"
                        class="status-select"
                    >

                        <option
                            value="Pending"
                            ${
                                status === 'Pending'
                                    ? 'selected'
                                    : ''
                            }
                        >
                            Pending
                        </option>


                        <option
                            value="In Progress"
                            ${
                                status === 'In Progress'
                                    ? 'selected'
                                    : ''
                            }
                        >
                            In Progress
                        </option>


                        <option
                            value="Resolved"
                            ${
                                status === 'Resolved'
                                    ? 'selected'
                                    : ''
                            }
                        >
                            Resolved
                        </option>

                    </select>


                    <button
                        class="update-btn"
                        onclick="updateComplaintStatus(
                            '${complaint._id}'
                        )"
                    >
                        Update
                    </button>

                </td>

            `;


            complaintsBody
                .appendChild(row);

        }
    );

}



// ----------------------------------------------------
// UPDATE COMPLAINT STATUS
// ----------------------------------------------------

async function updateComplaintStatus(
    complaintId
) {

    const select =
        document.getElementById(
            `status-${complaintId}`
        );


    if (!select) {

        alert(
            'Unable to find status selector.'
        );

        return;

    }


    const newStatus =
        select.value;


    const confirmed =
        window.confirm(
            `Change complaint status to "${newStatus}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(

                `/api/complaints/${complaintId}/status`,

                {

                    method: 'PATCH',

                    headers: {

                        'Content-Type':
                            'application/json'

                    },

                    body: JSON.stringify({

                        status:
                            newStatus

                    })

                }

            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(

                result.message ||

                'Unable to update complaint status.'

            );

        }


        complaintMessage.textContent =
            'Complaint status updated successfully.';


        await loadComplaints();

    }

    catch (error) {

        console.error(
            'Complaint update error:',
            error
        );


        alert(
            error.message
        );

    }

}



// ----------------------------------------------------
// STATUS CSS CLASS
// ----------------------------------------------------

function getStatusClass(status) {

    if (
        status === 'Resolved'
    ) {

        return 'status-resolved';

    }


    if (
        status === 'In Progress'
    ) {

        return 'status-progress';

    }


    return 'status-pending';

}



// ----------------------------------------------------
// ESCAPE HTML
// ----------------------------------------------------

function escapeHtml(value) {

    const div =
        document.createElement('div');


    div.textContent =
        String(
            value ?? ''
        );


    return div.innerHTML;

}



// ----------------------------------------------------
// REFRESH
// ----------------------------------------------------

refreshButton.addEventListener(
    'click',
    function () {

        loadComplaints();

    }
);



// ----------------------------------------------------
// LOGOUT
// ----------------------------------------------------

logoutButton.addEventListener(
    'click',
    function () {

        localStorage.removeItem(
            'token'
        );

        localStorage.removeItem(
            'user'
        );


        window.location.href =
            '/';

    }
);



// ----------------------------------------------------
// INITIAL LOAD
// ----------------------------------------------------

loadComplaints();



// ----------------------------------------------------
// AUTO REFRESH EVERY 10 SECONDS
// ----------------------------------------------------

setInterval(
    loadComplaints,
    10000
);