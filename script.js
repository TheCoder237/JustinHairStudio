// Get the booking form
const bookingForm = document.getElementById("bookingForm");

// Get the message area
const formMessage = document.getElementById("formMessage");

// Get the date input
const dateInput = document.getElementById("date");


// =============================
// PREVENT PAST DATES
// =============================

const today = new Date();

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

const currentDate = `${year}-${month}-${day}`;

dateInput.min = currentDate;


// =============================
// BOOKING FORM
// =============================

bookingForm.addEventListener("submit", function(event) {

    // Stop the page from refreshing
    event.preventDefault();


    // Get the information from the form
    const name = document.getElementById("name").value;
    const service = document.getElementById("service").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const notes = document.getElementById("notes").value;


    // Create an appointment object
    const appointment = {

        id: Date.now(),

        name: name,

        service: service,

        date: date,

        time: time,

        notes: notes,

        status: "Pending"

    };


    // Get existing appointments
    let appointments =
        JSON.parse(localStorage.getItem("appointments")) || [];


    // Add the new appointment
    appointments.push(appointment);


    // Save appointments
    localStorage.setItem(
        "appointments",
        JSON.stringify(appointments)
    );


    // Show confirmation
    formMessage.textContent =
        "Your appointment request has been submitted!";

    formMessage.style.color = "green";


    // Clear the form
    bookingForm.reset();

});

// =============================
// SERVICE CARD SELECTION
// =============================

// Get all service cards
const serviceCards = document.querySelectorAll(".service-card");

// Get the booking service dropdown
const serviceSelect = document.getElementById("service");

// Get the booking section
const bookingSection = document.getElementById("booking");


// When a service card is clicked
serviceCards.forEach(function(card) {

    card.addEventListener("click", function() {

        // Get the service from the card
        const selectedService = card.dataset.service;

        // Select that service in the booking form
        serviceSelect.value = selectedService;

        // Scroll to the booking section
        bookingSection.scrollIntoView({
            behavior: "smooth"
        });

    });

});

// =============================
// BOOKING CALENDAR
// =============================

// Calendar elements
const datePickerButton = document.getElementById("datePickerButton");
const calendar = document.getElementById("calendar");
const calendarMonth = document.getElementById("calendarMonth");
const calendarDays = document.getElementById("calendarDays");
const previousMonthButton = document.getElementById("previousMonth");
const nextMonthButton = document.getElementById("nextMonth");

// Store the month currently being displayed
let calendarDate = new Date();


// =============================
// JUSTIN'S SCHEDULE
// =============================

// Justin is available every day except Thursday
const availableDays = {
    0: true,  // Sunday
    1: true,  // Monday
    2: true,  // Tuesday
    3: true,  // Wednesday
    4: false, // Thursday
    5: true,  // Friday
    6: true   // Saturday
};


// =============================
// DISPLAY CALENDAR
// =============================

function renderCalendar() {

    // Get the year and month being displayed
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    // Display month and year
    calendarMonth.textContent =
        calendarDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });

    // Clear existing calendar days
    calendarDays.innerHTML = "";

    // Find the first day of the month
    const firstDay = new Date(year, month, 1);

    // Find the last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Day of the week the month starts on
    const startingDay = firstDay.getDay();

    // Number of days in the month
    const numberOfDays = lastDay.getDate();


    // Add empty spaces before the first day
    for (let i = 0; i < startingDay; i++) {

        const emptyDay = document.createElement("span");

        emptyDay.classList.add("calendar-empty");

        calendarDays.appendChild(emptyDay);
    }


    // Create each day
    for (let day = 1; day <= numberOfDays; day++) {

        const dayButton = document.createElement("button");

        dayButton.type = "button";

        dayButton.textContent = day;

        dayButton.classList.add("calendar-day");


        // Create the date represented by this button
        const date = new Date(year, month, day);

        const dayOfWeek = date.getDay();


        // Disable Thursdays
        if (!availableDays[dayOfWeek]) {

            dayButton.disabled = true;

            dayButton.classList.add("unavailable");

        }


        // Prevent dates before today
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        if (date < today) {

            dayButton.disabled = true;

            dayButton.classList.add("past");

        }


        // When an available date is selected
        dayButton.addEventListener("click", function() {

            selectDate(date);

        });


        calendarDays.appendChild(dayButton);
    }
}


// =============================
// SELECT DATE
// =============================

function selectDate(date) {

    // Create YYYY-MM-DD
    const year = date.getFullYear();

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const day =
        String(date.getDate()).padStart(2, "0");

    const selectedDate =
        `${year}-${month}-${day}`;


    // Store the date in the hidden input
    dateInput.value = selectedDate;

     // Create available appointment times
    createTimeSlots();

    // Display the selected date on the button
    datePickerButton.textContent =
        date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        });


    // Close the calendar
    calendar.classList.add("hidden");
}


// =============================
// OPEN / CLOSE CALENDAR
// =============================

datePickerButton.addEventListener("click", function() {

    calendar.classList.toggle("hidden");

    renderCalendar();

});


// =============================
// CHANGE MONTH
// =============================

previousMonthButton.addEventListener("click", function() {

    calendarDate.setMonth(
        calendarDate.getMonth() - 1
    );

    renderCalendar();

});


nextMonthButton.addEventListener("click", function() {

    calendarDate.setMonth(
        calendarDate.getMonth() + 1
    );

    renderCalendar();

});

// =============================
// AVAILABLE APPOINTMENT TIMES
// =============================

const timeSelect = document.getElementById("time");

// Service durations in minutes
const serviceDurations = {
    "Haircut": 30,
    "Hair Color": 90,
    "Haircut & Color": 120,
    "Touch-Up": 20
};


// Justin's working hours
const startTime = 8 * 60;   // 8:00 AM
const endTime = 22 * 60;   // 10:00 PM

// =============================
// CHECK FOR BOOKED TIMES
// =============================

function isTimeBooked(date, startMinutes, duration) {

    // Get existing appointments
    const appointments =
        JSON.parse(localStorage.getItem("appointments")) || [];


    // Calculate when the new appointment would end
    const newAppointmentEnd =
        startMinutes + duration;


    // Check each existing appointment
    return appointments.some(function(appointment) {

        // Only confirmed appointments block the schedule
        if (appointment.status !== "Accepted") {
            return false;
        }


        // Only check appointments on the selected date
        if (appointment.date !== date) {
            return false;
        }


        // Get the existing appointment's start time
        const [hour, minute] =
            appointment.time.split(":").map(Number);


        const existingStart =
            hour * 60 + minute;


        // Get the existing service duration
        const existingDuration =
            serviceDurations[appointment.service];


        const existingEnd =
            existingStart + existingDuration;


        // Check if the appointments overlap
        return (
            startMinutes < existingEnd &&
            newAppointmentEnd > existingStart
        );

    });
}

function createTimeSlots() {

    // Clear the current options
    timeSelect.innerHTML = `
        <option value="">
            Select a time
        </option>
    `;


    // Make sure a date has been selected
    if (!dateInput.value) {

        timeSelect.disabled = true;

        timeSelect.innerHTML = `
            <option value="">
                Select a date first
            </option>
        `;

        return;
    }


    // Get the selected service
    const selectedService = serviceSelect.value;

    // Get the duration of the selected service
    const duration = serviceDurations[selectedService];


    // Make sure a service has been selected
    if (!duration) {

        timeSelect.disabled = true;

        timeSelect.innerHTML = `
            <option value="">
                Select a service first
            </option>
        `;

        return;
    }


    // Create appointment start times
    for (
        let minutes = startTime;
        minutes + duration <= endTime;
        minutes += 30
    ) {

        const hour = Math.floor(minutes / 60);
        const minute = minutes % 60;


        // Value stored by the form
        const timeValue =
            String(hour).padStart(2, "0") +
            ":" +
            String(minute).padStart(2, "0");


        // Time displayed to the customer
        const displayHour =
            hour % 12 || 12;

        const displayMinute =
            String(minute).padStart(2, "0");

        const period =
            hour >= 12 ? "PM" : "AM";


        const displayTime =
            `${displayHour}:${displayMinute} ${period}`;

        // Check if this time overlaps a confirmed appointment
        const booked =
            isTimeBooked(
                dateInput.value,
                minutes,
                duration
            );
        
        
        // Do not show booked times
        if (booked) {
            continue;
        }


        // Create the option
        const option =
            document.createElement("option");

        option.value = timeValue;

        option.textContent = displayTime;

        timeSelect.appendChild(option);
        
    }


    // Enable the time dropdown
    timeSelect.disabled = false;
}

// =============================
// UPDATE TIMES WHEN SERVICE CHANGES
// =============================

serviceSelect.addEventListener("change", function() {

    // Clear the previously selected time
    timeSelect.value = "";

    // Create new available times
    createTimeSlots();

});