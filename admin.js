
// =============================
// SUPABASE SETUP
// =============================

const SUPABASE_URL =
    "https://pggbixquqqmdcuvmnbzf.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_XzJ_Br01g38uTHaetQa3CA_JJRJas6u";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =============================
// GET PAGE ELEMENTS
// =============================

const loginSection =
    document.getElementById("loginSection");

const loginForm =
    document.getElementById("loginForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginMessage =
    document.getElementById("loginMessage");


const dashboardHeader =
    document.getElementById("dashboardHeader");

const dashboardContent =
    document.getElementById("dashboardContent");

const logoutButton =
    document.getElementById("logoutButton");


const appointmentList =
    document.getElementById("appointmentList");

const rebookSection =
    document.getElementById("rebookSection");

const rebookDate =
    document.getElementById("rebookDate");

const rebookTime =
    document.getElementById("rebookTime");

const confirmRebookButton =
    document.getElementById("confirmRebookButton");

const cancelRebookButton =
    document.getElementById("cancelRebookButton");

const rebookMessage =
    document.getElementById("rebookMessage");    

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
// SHOW LOGIN
// =============================

function showLogin(message = "") {

    loginSection.hidden = false;

    dashboardHeader.hidden = true;

    dashboardContent.hidden = true;

    loginMessage.textContent = message;

}


// =============================
// SHOW DASHBOARD
// =============================

function showDashboard() {

    loginSection.hidden = true;

    dashboardHeader.hidden = false;

    dashboardContent.hidden = false;

}


// =============================
// CHECK ADMIN ACCESS
// =============================

async function checkAdminAccess() {

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    // No one is logged in
    if (!session) {

        showLogin();

        return false;

    }


    // Check whether logged-in user
    // exists in the admins table
    const {
        data: isAdmin,
        error
    } = await supabaseClient.rpc(
        "is_admin"
    );


    if (error) {

        console.error(
            "Admin check error:",
            error
        );

        await supabaseClient.auth.signOut();

        showLogin(
            "Unable to verify admin access."
        );

        return false;

    }


    if (!isAdmin) {

        await supabaseClient.auth.signOut();

        showLogin(
            "This account does not have admin access."
        );

        return false;

    }


    showDashboard();

    await loadDashboard();

    return true;

}


// =============================
// LOGIN
// =============================

loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const email =
            loginEmail.value.trim();

        const password =
            loginPassword.value;


        loginMessage.textContent =
            "Logging in...";


        const {
            error
        } = await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

        });


        if (error) {

            console.error(
                "Login error:",
                error
            );

            loginMessage.textContent =
                "Incorrect email or password.";

            return;

        }


        loginPassword.value = "";

        loginMessage.textContent = "";


        await checkAdminAccess();

    }
);


// =============================
// LOG OUT
// =============================

logoutButton.addEventListener(
    "click",
    async function() {

        const {
            error
        } = await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                "Logout error:",
                error
            );

            return;

        }


        showLogin();

        loginEmail.value = "";

        loginPassword.value = "";

    }
);


// =============================
// FORMAT DATE
// =============================

function formatDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );


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

    date.setHours(
        Number(hour)
    );

    date.setMinutes(
        Number(minute)
    );


    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


// =============================
// ESCAPE CUSTOMER INPUT
// =============================

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =============================
// GET APPOINTMENTS
// =============================

async function getAppointments() {

    const {
        data,
        error
    } = await supabaseClient
        .from("appointments")
        .select("*")
        .order("date", {
            ascending: true
        })
        .order("time", {
            ascending: true
        });


    if (error) {

        console.error(
            "Error loading appointments:",
            error
        );


        appointmentList.innerHTML = `
            <div class="empty-appointments">

                <p>
                    Unable to load appointments.
                </p>

            </div>
        `;


        return [];

    }


    return data || [];

}


// =============================
// LOAD DASHBOARD
// =============================

async function loadDashboard() {

    const appointments =
        await getAppointments();


    updateStatistics(
        appointments
    );


    displayAppointments(
        appointments
    );

}


// =============================
// UPDATE STATISTICS
// =============================

function updateStatistics(
    appointments
) {

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

function displayAppointments(
    appointments
) {

    const selectedStatus =
        statusFilter.value;


    const filteredAppointments =
        appointments.filter(
            appointment => {

                if (
                    selectedStatus === "All"
                ) {

                    return true;

                }


                return (
                    appointment.status ===
                    selectedStatus
                );

            }
        );


    appointmentList.innerHTML = "";


    if (
        filteredAppointments.length === 0
    ) {

        appointmentList.innerHTML = `
            <div class="empty-appointments">

                <p>
                    No appointments found.
                </p>

            </div>
        `;

        return;

    }


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
                        ${escapeHtml(
                            appointment.name
                        )}
                    </h3>


                    <p class="appointment-details">

                        <strong>
                            ${escapeHtml(
                                appointment.service
                            )}
                        </strong>

                        <br>

                        ${formatDate(
                            appointment.date
                        )}

                        at

                        ${formatTime(
                            appointment.time
                        )}

                        <br>

                        ${escapeHtml(
                            appointment.email
                        )}

                        <br>

                        ${escapeHtml(
                            appointment.phone
                        )}

                    </p>


                    ${
                        appointment.notes

                        ? `

                            <div class="appointment-notes">

                                <strong>
                                    Notes:
                                </strong>

                                ${escapeHtml(
                                    appointment.notes
                                )}

                            </div>

                        `

                        : ""
                    }


                    <span class="appointment-status">

                        ${escapeHtml(
                            appointment.status
                        )}

                    </span>

                </div>


                <div class="appointment-actions">


                    ${
                        appointment.status === "Pending"

                        ? `

                            <button
                                class="accept-button"
                                onclick="updateStatus(
                                    '${appointment.id}',
                                    'Accepted'
                                )"
                            >

                                Accept

                            </button>


                            <button
                                class="decline-button"
                                onclick="updateStatus(
                                    '${appointment.id}',
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
                                    '${appointment.id}',
                                    'Completed'
                                )"
                            >

                                Complete

                            </button>


                            <button
                                class="decline-button"
                                onclick="updateStatus(
                                    '${appointment.id}',
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
                                onclick="openRebook(
                                    '${appointment.id}'
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
// REBOOK
// =============================

let appointmentToRebook = null;


// Service durations

const rebookServiceDurations = {

    "Haircut": 30,

    "Hair Color": 90,

    "Haircut & Color": 120,

    "Touch-Up": 20

};


// Calendar elements

const rebookDatePickerButton =
    document.getElementById(
        "rebookDatePickerButton"
    );

const rebookCalendar =
    document.getElementById(
        "rebookCalendar"
    );


const rebookCalendarMonth =
    document.getElementById(
        "rebookCalendarMonth"
    );

const rebookCalendarDays =
    document.getElementById(
        "rebookCalendarDays"
    );

const rebookPreviousMonth =
    document.getElementById(
        "rebookPreviousMonth"
    );

const rebookNextMonth =
    document.getElementById(
        "rebookNextMonth"
    );


let rebookCalendarDate =
    new Date();


// =============================
// OPEN REBOOK
// =============================

function openRebook(appointmentId) {

    appointmentToRebook =
        appointmentId;


    rebookSection.hidden =
        false;


    rebookDate.value =
        "";


    rebookDatePickerButton.textContent =
        "Select a date";


    rebookTime.innerHTML = `
        <option value="">
            Select a date first
        </option>
    `;


    rebookTime.disabled =
        true;


    rebookMessage.textContent =
        "";


    rebookCalendar.classList.add(
        "hidden"
    );


    rebookCalendarDate =
        new Date();


    rebookSection.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// Make the function available
// to the Rebook button created
// inside the appointment cards.

window.openRebook =
    openRebook;


// =============================
// RENDER REBOOK CALENDAR
// =============================

function renderRebookCalendar() {

    const year =
        rebookCalendarDate.getFullYear();

    const month =
        rebookCalendarDate.getMonth();


    rebookCalendarMonth.textContent =
        rebookCalendarDate.toLocaleDateString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );


    rebookCalendarDays.innerHTML =
        "";


    const firstDay =
        new Date(
            year,
            month,
            1
        );


    const lastDay =
        new Date(
            year,
            month + 1,
            0
        );


    const startingDay =
        firstDay.getDay();


    const numberOfDays =
        lastDay.getDate();


    // Empty spaces

    for (
        let i = 0;
        i < startingDay;
        i++
    ) {

        const emptyDay =
            document.createElement(
                "span"
            );


        emptyDay.classList.add(
            "rebook-calendar-empty"
        );


        rebookCalendarDays.appendChild(
            emptyDay
        );

    }


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    // Days

    for (
        let day = 1;
        day <= numberOfDays;
        day++
    ) {

        const date =
            new Date(
                year,
                month,
                day
            );


        const dayButton =
            document.createElement(
                "button"
            );


        dayButton.type =
            "button";


        dayButton.textContent =
            day;


        dayButton.classList.add(
            "rebook-calendar-day"
        );


        const dayOfWeek =
            date.getDay();


        // Thursday unavailable

        if (
            dayOfWeek === 4
        ) {

            dayButton.disabled =
                true;

            dayButton.classList.add(
                "unavailable"
            );

        }


        // Past dates unavailable

        if (
            date < today
        ) {

            dayButton.disabled =
                true;

            dayButton.classList.add(
                "past"
            );

        }


        // Select date

        if (
            !dayButton.disabled
        ) {

            dayButton.addEventListener(
                "click",
                function() {

                    selectRebookDate(
                        date
                    );

                }
            );

        }


        rebookCalendarDays.appendChild(
            dayButton
        );

    }

}


// =============================
// SELECT REBOOK DATE
// =============================

function selectRebookDate(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    const selectedDate =
        `${year}-${month}-${day}`;


    rebookDate.value =
        selectedDate;


    rebookDatePickerButton.textContent =
        date.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );


    rebookCalendar.classList.add(
        "hidden"
    );


    loadRebookTimes();

}


// =============================
// OPEN / CLOSE CALENDAR
// =============================

rebookDatePickerButton.addEventListener(
    "click",
    function() {

        renderRebookCalendar();


        rebookCalendar.classList.toggle(
            "hidden"
        );

    }
);


// =============================
// CHANGE MONTH
// =============================

rebookPreviousMonth.addEventListener(
    "click",
    function() {

        rebookCalendarDate.setMonth(
            rebookCalendarDate.getMonth() - 1
        );


        renderRebookCalendar();

    }
);


rebookNextMonth.addEventListener(
    "click",
    function() {

        rebookCalendarDate.setMonth(
            rebookCalendarDate.getMonth() + 1
        );


        renderRebookCalendar();

    }
);


// =============================
// LOAD AVAILABLE REBOOK TIMES
// =============================

async function loadRebookTimes() {

    const selectedDate =
        rebookDate.value;


    rebookTime.innerHTML = `
        <option value="">
            Select a time
        </option>
    `;


    rebookTime.disabled =
        true;


    if (
        !selectedDate
    ) {

        return;

    }


    // Get original appointment

    const {
        data: oldAppointment,
        error
    } = await supabaseClient
        .from("appointments")
        .select("service")
        .eq(
            "id",
            appointmentToRebook
        )
        .single();


    if (error) {

        console.error(
            "Error finding appointment:",
            error
        );


        rebookMessage.textContent =
            "Unable to load the appointment.";


        return;

    }


    const duration =
        rebookServiceDurations[
            oldAppointment.service
        ];


    if (!duration) {

        rebookMessage.textContent =
            "Unable to determine the service duration.";


        return;

    }


    const startTime =
        8 * 60;


    const endTime =
        22 * 60;


    const now =
        new Date();


    const todayString =
        `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, "0")}-${String(
            now.getDate()
        ).padStart(2, "0")}`;


    for (
        let minutes = startTime;
        minutes + duration <= endTime;
        minutes += 30
    ) {

        // Don't show past times today

        if (
            selectedDate === todayString
        ) {

            const currentMinutes =
                now.getHours() * 60 +
                now.getMinutes();


            if (
                minutes <= currentMinutes
            ) {

                continue;

            }

        }


        const booked =
            await isRebookTimeBooked(
                selectedDate,
                minutes,
                duration
            );


        if (
            booked
        ) {

            continue;

        }


        const hour =
            Math.floor(
                minutes / 60
            );


        const minute =
            minutes % 60;


        const timeValue =
            `${String(hour).padStart(
                2,
                "0"
            )}:${String(minute).padStart(
                2,
                "0"
            )}`;


        const displayHour =
            hour % 12 || 12;


        const displayMinute =
            String(
                minute
            ).padStart(
                2,
                "0"
            );


        const period =
            hour >= 12
                ? "PM"
                : "AM";


        const option =
            document.createElement(
                "option"
            );


        option.value =
            timeValue;


        option.textContent =
            `${displayHour}:${displayMinute} ${period}`;


        rebookTime.appendChild(
            option
        );

    }


    if (
        rebookTime.options.length === 1
    ) {

        rebookTime.innerHTML = `
            <option value="">
                No available times
            </option>
        `;


        return;

    }


    rebookTime.disabled =
        false;

}


// =============================
// CHECK REBOOK AVAILABILITY
// =============================

async function isRebookTimeBooked(
    date,
    startMinutes,
    duration
) {

    const {
        data: appointments,
        error
    } = await supabaseClient.rpc(
        "get_booked_appointments",
        {
            requested_date: date
        }
    );


    if (error) {

        console.error(
            "Error checking rebook availability:",
            error
        );


        return true;

    }


    const newAppointmentEnd =
        startMinutes +
        duration;


    return appointments.some(
        function(appointment) {

            const [
                hour,
                minute
            ] =
                appointment
                    .appointment_time
                    .split(":")
                    .map(Number);


            const existingStart =
                hour * 60 +
                minute;


            const existingDuration =
                rebookServiceDurations[
                    appointment
                        .appointment_service
                ];


            const existingEnd =
                existingStart +
                existingDuration;


            return (
                startMinutes <
                existingEnd
                &&
                newAppointmentEnd >
                existingStart
            );

        }
    );

}


// =============================
// CONFIRM REBOOK
// =============================

confirmRebookButton.addEventListener(
    "click",
    async function() {

        const newDate =
            rebookDate.value;


        const newTime =
            rebookTime.value;


        if (
            !appointmentToRebook
        ) {

            rebookMessage.textContent =
                "Please select an appointment to rebook.";


            return;

        }


        if (
            !newDate ||
            !newTime
        ) {

            rebookMessage.textContent =
                "Please select a date and time.";


            return;

        }


        rebookMessage.textContent =
            "Rebooking...";


        const {
            data: oldAppointment,
            error: findError
        } = await supabaseClient
            .from("appointments")
            .select("*")
            .eq(
                "id",
                appointmentToRebook
            )
            .single();


        if (findError) {

            console.error(
                "Error finding appointment:",
                findError
            );


            rebookMessage.textContent =
                "Unable to find the appointment.";


            return;

        }


        const {
            error: insertError
        } = await supabaseClient
            .from("appointments")
            .insert([{

                name:
                    oldAppointment.name,

                email:
                    oldAppointment.email,

                phone:
                    oldAppointment.phone,

                service:
                    oldAppointment.service,

                date:
                    newDate,

                time:
                    newTime,

                notes:
                    oldAppointment.notes,

                status:
                    "Pending"

            }]);


        if (insertError) {

            console.error(
                "Error creating rebooked appointment:",
                insertError
            );


            rebookMessage.textContent =
                "There was a problem creating the new appointment.";


            return;

        }


        rebookMessage.textContent =
            "Rebook request created!";


        rebookSection.hidden =
            true;


        rebookDate.value =
            "";


        rebookDatePickerButton.textContent =
            "Select a date";


        rebookTime.innerHTML = `
            <option value="">
                Select a date first
            </option>
        `;


        rebookTime.disabled =
            true;


        appointmentToRebook =
            null;


        await loadDashboard();

    }
);


// =============================
// CANCEL REBOOK
// =============================

cancelRebookButton.addEventListener(
    "click",
    function() {

        rebookSection.hidden =
            true;


        rebookCalendar.classList.add(
            "hidden"
        );


        rebookDate.value =
            "";


        rebookDatePickerButton.textContent =
            "Select a date";


        rebookTime.innerHTML = `
            <option value="">
                Select a date first
            </option>
        `;


        rebookTime.disabled =
            true;


        rebookMessage.textContent =
            "";


        appointmentToRebook =
            null;

    }
);

// =============================
// UPDATE APPOINTMENT STATUS
// =============================

async function updateStatus(
    appointmentId,
    newStatus
) {

    const {
        error
    } = await supabaseClient
        .from("appointments")
        .update({
            status: newStatus
        })
        .eq(
            "id",
            appointmentId
        );


    if (error) {

        console.error(
            "Error updating appointment:",
            error
        );


        alert(
            "There was a problem updating the appointment."
        );


        return;

    }


    await loadDashboard();

}


// =============================
// REBOOK APPOINTMENT
// =============================




// =============================
// FILTER APPOINTMENTS
// =============================

statusFilter.addEventListener(
    "change",
    async function() {

        const appointments =
            await getAppointments();


        displayAppointments(
            appointments
        );

    }
);


// =============================
// START PAGE
// =============================

checkAdminAccess();