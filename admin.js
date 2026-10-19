import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

import { app } from "./firebase-config.js";


const auth = getAuth(app);

const ADMIN_EMAIL =
    "sagarpetwal372@gmail.com";


// =========================
// CHECK ADMIN LOGIN
// =========================

onAuthStateChanged(
    auth,
    function(user) {

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        if (
            user.email.trim().toLowerCase() !==
            ADMIN_EMAIL.trim().toLowerCase()
        ) {

            alert(
                "Access denied. Admin only."
            );

            window.location.href =
                "dashboard.html";

            return;
        }

    }
);


// =========================
// HISTORY BUTTONS
// =========================

const todayButton =
    document.getElementById("todayButton");

const yesterdayButton =
    document.getElementById("yesterdayButton");

const weekButton =
    document.getElementById("weekButton");

const monthButton =
    document.getElementById("monthButton");

const dateButton =
    document.getElementById("dateButton");

const datePicker =
    document.getElementById("datePicker");


// Today

if (todayButton) {

    todayButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "admin-history.html?filter=today";

        }
    );

}


// Yesterday

if (yesterdayButton) {

    yesterdayButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "admin-history.html?filter=yesterday";

        }
    );

}


// This Week

if (weekButton) {

    weekButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "admin-history.html?filter=week";

        }
    );

}


// This Month

if (monthButton) {

    monthButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "admin-history.html?filter=month";

        }
    );

}


// Specific Date

if (dateButton) {

    dateButton.addEventListener(
        "click",
        function() {

            const selectedDate =
                datePicker.value;


            if (!selectedDate) {

                alert(
                    "Please select a date first."
                );

                return;
            }


            window.location.href =
                "admin-history.html?filter=date&date=" +
                encodeURIComponent(
                    selectedDate
                );

        }
    );

}



// Automatically open selected date

if (datePicker) {

    datePicker.addEventListener(
        "change",
        function() {

            const selectedDate =
                datePicker.value;


            if (!selectedDate) {
                return;
            }


            window.location.href =
                "admin-history.html?filter=date&date=" +
                encodeURIComponent(
                    selectedDate
                );

        }
    );

}




// =========================
// LOGOUT
// =========================

const logoutButton =
    document.getElementById("logoutButton");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function() {

            logoutButton.disabled = true;

            logoutButton.textContent =
                "Logging out...";


            try {

                await signOut(auth);

                window.location.href =
                    "login.html";

            } catch (error) {

                console.error(
                    "Logout Error:",
                    error
                );


                logoutButton.disabled =
                    false;

                logoutButton.textContent =
                    "Logout";


                alert(
                    "Unable to logout. Please try again."
                );

            }

        }
    );

}