const complaintForm =
  document.getElementById('complaintForm');

const studentIdInput =
  document.getElementById('studentId');

const studentNameInput =
  document.getElementById('studentName');

const descriptionInput =
  document.getElementById('description');

const messageBox =
  document.getElementById('message');

const complaintsContainer =
  document.getElementById('complaintsContainer');

const loadComplaintsButton =
  document.getElementById('loadComplaints');


// ----------------------------------------------------
// Display message
// ----------------------------------------------------

function displayMessage(message, type) {

  messageBox.textContent = message;

  messageBox.className =
    `message ${type}`;

  messageBox.style.display = 'block';

}


// ----------------------------------------------------
// Clear message
// ----------------------------------------------------

function clearMessage() {

  messageBox.textContent = '';

  messageBox.className = 'message';

  messageBox.style.display = 'none';

}


// ----------------------------------------------------
// Submit complaint
// ----------------------------------------------------

complaintForm.addEventListener(
  'submit',
  async function (event) {

    event.preventDefault();

    clearMessage();


    const studentId =
      studentIdInput.value.trim();

    const studentName =
      studentNameInput.value.trim();

    const description =
      descriptionInput.value.trim();


    // Client-side validation

    if (!studentId) {

      displayMessage(
        'Please enter your Student ID.',
        'error'
      );

      return;
    }


    if (!studentName) {

      displayMessage(
        'Please enter your name.',
        'error'
      );

      return;
    }


    if (!description) {

      displayMessage(
        'Please describe your complaint.',
        'error'
      );

      return;
    }


    if (description.length < 5) {

      displayMessage(
        'Complaint must contain at least 5 characters.',
        'error'
      );

      return;
    }


    try {

      const response =
        await fetch('/api/complaints', {

          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            studentId,
            studentName,
            description
          })

        });


      const result =
        await response.json();


      if (!response.ok) {

        displayMessage(
          result.message ||
          'Unable to submit complaint.',
          'error'
        );

        return;
      }


      displayMessage(
        'Complaint submitted successfully.',
        'success'
      );


      descriptionInput.value = '';


      // Automatically reload complaint list

      loadStudentComplaints();

    }

    catch (error) {

      console.error(error);

      displayMessage(
        'Server connection error.',
        'error'
      );

    }

  }
);


// ----------------------------------------------------
// Load complaints button
// ----------------------------------------------------

loadComplaintsButton.addEventListener(
  'click',
  function () {

    loadStudentComplaints();

  }
);


// ----------------------------------------------------
// Retrieve student's complaints
// ----------------------------------------------------

async function loadStudentComplaints() {

  const studentId =
    studentIdInput.value.trim();


  if (!studentId) {

    complaintsContainer.innerHTML = `
        <p class="error-text">
            Please enter your Student ID first.
        </p>
    `;

    return;

  }


  complaintsContainer.innerHTML = `
      <p>Loading complaints...</p>
  `;


  try {

    const response =
      await fetch(
        `/api/complaints/student/${encodeURIComponent(studentId)}`
      );


    const result =
      await response.json();


    if (!response.ok) {

      complaintsContainer.innerHTML = `
          <p class="error-text">
              ${result.message}
          </p>
      `;

      return;

    }


    displayComplaints(result.data);

  }

  catch (error) {

    console.error(error);

    complaintsContainer.innerHTML = `
        <p class="error-text">
            Unable to connect to the server.
        </p>
    `;

  }

}


// ----------------------------------------------------
// Display complaint cards
// ----------------------------------------------------

function displayComplaints(complaints) {

  if (!complaints || complaints.length === 0) {

    complaintsContainer.innerHTML = `
        <p>No complaints have been submitted yet.</p>
    `;

    return;

  }


  complaintsContainer.innerHTML = '';


  complaints.forEach((complaint) => {

    const card =
      document.createElement('div');


    card.classList.add(
      'complaint-item'
    );


    const createdDate =
      new Date(
        complaint.createdAt
      ).toLocaleString();


    card.innerHTML = `

        <div class="complaint-header">

            <strong>
                Complaint
            </strong>

            <span class="status ${getStatusClass(complaint.status)}">
                ${escapeHtml(complaint.status)}
            </span>

        </div>


        <p>
            ${escapeHtml(complaint.description)}
        </p>


        <small>
            Submitted:
            ${escapeHtml(createdDate)}
        </small>

    `;


    complaintsContainer.appendChild(card);

  });

}


// ----------------------------------------------------
// Status styling
// ----------------------------------------------------

function getStatusClass(status) {

  if (status === 'Resolved') {
    return 'resolved';
  }

  if (status === 'In Progress') {
    return 'progress';
  }

  return 'pending';

}


// ----------------------------------------------------
// Basic HTML escaping
// ----------------------------------------------------

function escapeHtml(value) {

  const div =
    document.createElement('div');

  div.textContent =
    String(value ?? '');

  return div.innerHTML;

}