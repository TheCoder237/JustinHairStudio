// =============================
// GET PAGE ELEMENTS
// =============================

const appointmentList =
    document.getElementById("appointmentList");

const statusFilter =
    document.getElementById("statusFilter");

const pendingCount =
    document.getElementById("pendingCount");

const acceptedCount =
    document.getElementById("acceptedCount");

const declinedCount =
    document.getElementById("declinedCount");

const completedCount =
    document.getElementById("completedCount");

const cancelledCount =
    document.getElementById("cancelledCount");

const totalCount =
    document.getElementById("totalCount");


// =============================
// GET APPOINTMENTS
// =============================

function getAppointments() {

    return JSON.parse(
        localStorage.getItem("appointments")
    ) || [];

}


// =============================
// SAVE APPOINTMENTS
// =============================

function saveAppointments(appointments) {

    localStorage.setItem(
        "appointments",
        JSON.stringify(appointments)
    );

}


// =============================
// FORMAT DATE
// =============================

function formatDate(dateString) {

    const date =
        new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        }
    );

}


// =============================
// FORMAT TIME
// =============================

function formatTime(timeString) {

    const [hour, minute] =
        timeString.split(":");

    const date = new Date();

    date.setHours(hour);
    date.setMinutes(minute);

    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


// =============================
// UPDATE STATISTICS
// =============================

function updateStatistics() {

    const appointments =
        getAppointments();


    const pending =
        appointments.filter(
            appointment =>
                appointment.status === "Pending"
        );


    const accepted =
        appointments.filter(
            appointment =>
                appointment.status === "Accepted"
        );


    const declined =
        appointments.filter(
            appointment =>
                appointment.status === "Declined"
        );

    const completed =
        appointments.filter(
            appointment =>
                appointment.status === "Completed"
        );


    const cancelled =
        appointments.filter(
            appointment =>
                appointment.status === "Cancelled"
        );

    pendingCount.textContent =
        pending.length;

    acceptedCount.textContent =
        accepted.length;

    declinedCount.textContent =
        declined.length;

    completedCount.textContent =
        completed.length;

    cancelledCount.textContent =
        cancelled.length;

    totalCount.textContent =
        appointments.length;

}


// =============================
// DISPLAY APPOINTMENTS
// =============================

function displayAppointments() {

    const appointments =
        getAppointments();


    const selectedStatus =
        statusFilter.value;


    // Filter appointments
    const filteredAppointments =
        appointments.filter(
            appointment => {

                if (selectedStatus === "All") {
                    return true;
                }

                return (
                    appointment.status ===
                    selectedStatus
                );

            }
        );


    // Clear old appointments
    appointmentList.innerHTML = "";


    // No appointments
    if (filteredAppointments.length === 0) {

        appointmentList.innerHTML = `
            <div class="empty-appointments">

                <p>
                    No appointments found.
                </p>

            </div>
        `;

        return;

    }


    // Display each appointment
    filteredAppointments.forEach(
        appointment => {

            const appointmentCard =
                document.createElement("div");

            appointmentCard.classList.add(
                "appointment-card"
            );


            appointmentCard.innerHTML = `

                <div>

                    <h3>
                        ${appointment.name}
                    </h3>


                    <p class="appointment-details">

                        <strong>
                            ${appointment.service}
                        </strong>

                        <br>

                        ${formatDate(
                            appointment.date
                        )}

                        at

                        ${formatTime(
                            appointment.time
                        )}

                    </p>


                    ${
                        appointment.notes

                        ? `
                            <div class="appointment-notes">

                                <strong>
                                    Notes:
                                </strong>

                                ${appointment.notes}

                            </div>
                        `

                        : ""
                    }


                    <span class="appointment-status">

                        ${appointment.status}

                    </span>

                </div>


                <div class="appointment-actions">

                    ${
                        appointment.status === "Pending"
                    
                        ? `
                            <button
                                class="accept-button"
                                onclick="updateStatus(
                                    ${appointment.id},
                                    'Accepted'
                                )"
                            >
                    
                                Accept
                    
                            </button>
                    
                    
                            <button
                                class="decline-button"
                                onclick="updateStatus(
                                    ${appointment.id},
                                    'Declined'
                                )"
                            >
                    
                                Decline
                    
                            </button>
                        `
                    
                        : ""
                    }
                
                
                    ${
                        appointment.status === "Accepted"
                    
                        ? `
                            <button
                                class="accept-button"
                                onclick="updateStatus(
                                    ${appointment.id},
                                    'Completed'
                                )"
                            >
                    
                                Complete
                    
                            </button>
                    
                    
                            <button
                                class="decline-button"
                                onclick="updateStatus(
                                    ${appointment.id},
                                    'Cancelled'
                                )"
                            >
                    
                                Cancel
                    
                            </button>
                        `
                    
                        : ""
                    }
                    ${
                        appointment.status === "Declined" ||
                        appointment.status === "Cancelled"

                        ? `
                            <button
                                class="accept-button"
                                onclick="rebookAppointment(
                                    ${appointment.id}
                                )"
                            >

                                Rebook

                            </button>
                        `

                        : ""
                    }
                </div>

            `;


            appointmentList.appendChild(
                appointmentCard
            );

        }
    );

}


// =============================
// UPDATE APPOINTMENT STATUS
// =============================

function updateStatus(
    appointmentId,
    newStatus
) {

    const appointments =
        getAppointments();


    const appointment =
        appointments.find(
            appointment =>
                appointment.id ===
                appointmentId
        );


    if (appointment) {

        appointment.status =
            newStatus;

    }


    saveAppointments(
        appointments
    );


    updateStatistics();

    displayAppointments();

}

// =============================
// REBOOK APPOINTMENT
// =============================

function rebookAppointment(appointmentId) {

    const appointments =
        getAppointments();


    const oldAppointment =
        appointments.find(
            appointment =>
                appointment.id === appointmentId
        );


    if (!oldAppointment) {
        return;
    }


    const newAppointment = {

        id: Date.now(),

        name: oldAppointment.name,

        service: oldAppointment.service,

        date: oldAppointment.date,

        time: oldAppointment.time,

        notes: oldAppointment.notes,

        status: "Pending"

    };


    appointments.push(
        newAppointment
    );


    saveAppointments(
        appointments
    );


    updateStatistics();

    displayAppointments();

}


// =============================
// FILTER APPOINTMENTS
// =============================

statusFilter.addEventListener(
    "change",
    function() {

        displayAppointments();

    }
);


// =============================
// LOAD DASHBOARD
// =============================

updateStatistics();

displayAppointments();