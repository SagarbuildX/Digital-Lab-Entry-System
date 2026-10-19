import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

import { app, db } from "./firebase-config.js";


const auth = getAuth(app);

const historyHeading =
    document.getElementById("historyHeading");

const historyCount =
    document.getElementById("historyCount");

const historyTitle =
    document.getElementById("historyTitle");

const historyEntries =
    document.getElementById("historyEntries");


const ADMIN_EMAIL =
    "sagarpetwal372@gmail.com";


// =========================
// DATE FUNCTIONS
// =========================

function getDateKey(date) {

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


function formatDate(date) {

    return date.toLocaleDateString(
        undefined,
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

}


// =========================
// AUTH CHECK
// =========================

onAuthStateChanged(
    auth,
    async function(user) {

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


        await loadHistory();

    }
);


// =========================
// LOAD HISTORY
// =========================

async function loadHistory() {

    historyEntries.innerHTML = "";

    historyHeading.textContent =
        "Loading...";

    historyCount.textContent =
        "Loading entry records...";


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "labEntries"
                )
            );


        let allEntries = [];


        snapshot.forEach(
            function(entryDoc) {

                const data =
                    entryDoc.data();


                if (!data.enteredAt) {
                    return;
                }


                allEntries.push(data);

            }
        );


        // Latest entry first

        allEntries.sort(
            function(a, b) {

                return (
                    b.enteredAt.toMillis() -
                    a.enteredAt.toMillis()
                );

            }
        );


        // Get selected filter

        const params =
            new URLSearchParams(
                window.location.search
            );


        const filter =
            params.get("filter") || "today";


        const selectedDate =
            params.get("date");


        // =========================
        // TODAY
        // =========================

        if (filter === "today") {

            const today =
                new Date();


            const todayKey =
                getDateKey(today);


            const entries =
                allEntries.filter(
                    function(data) {

                        return (
                            getDateKey(
                                data.enteredAt.toDate()
                            ) ===
                            todayKey
                        );

                    }
                );


            displaySingleDay(
                entries,
                "Today's Entries",
                "Today's laboratory entry records."
            );


            return;
        }


        // =========================
        // YESTERDAY
        // =========================

        if (filter === "yesterday") {

            const yesterday =
                new Date();


            yesterday.setDate(
                yesterday.getDate() - 1
            );


            const yesterdayKey =
                getDateKey(yesterday);


            const entries =
                allEntries.filter(
                    function(data) {

                        return (
                            getDateKey(
                                data.enteredAt.toDate()
                            ) ===
                            yesterdayKey
                        );

                    }
                );


            displaySingleDay(
                entries,
                "Yesterday's Entries",
                "Yesterday's laboratory entry records."
            );


            return;
        }


        // =========================
        // SPECIFIC DATE
        // =========================

        if (
            filter === "date" &&
            selectedDate
        ) {

            const parts =
                selectedDate.split("-");


            const selected =
                new Date(
                    Number(parts[0]),
                    Number(parts[1]) - 1,
                    Number(parts[2])
                );


            const entries =
                allEntries.filter(
                    function(data) {

                        return (
                            getDateKey(
                                data.enteredAt.toDate()
                            ) ===
                            selectedDate
                        );

                    }
                );


            displaySingleDay(
                entries,
                formatDate(selected),
                "Laboratory entries for selected date."
            );


            return;
        }


        // =========================
        // THIS WEEK
        // =========================

        if (filter === "week") {

            const today =
                new Date();


            const day =
                today.getDay();


            const difference =
                day === 0 ? 6 : day - 1;


            const monday =
                new Date(today);


            monday.setDate(
                today.getDate() - difference
            );


            monday.setHours(
                0,
                0,
                0,
                0
            );


            const sunday =
                new Date(monday);


            sunday.setDate(
                monday.getDate() + 6
            );


            sunday.setHours(
                23,
                59,
                59,
                999
            );


            const entries =
                allEntries.filter(
                    function(data) {

                        const date =
                            data.enteredAt.toDate();


                        return (
                            date >= monday &&
                            date <= sunday
                        );

                    }
                );


            displayGrouped(
                entries,
                "This Week",
                "Laboratory entries for the current week."
            );


            return;
        }


        // =========================
        // THIS MONTH
        // =========================

        if (filter === "month") {

            const today =
                new Date();


            const year =
                today.getFullYear();


            const month =
                today.getMonth();


            const entries =
                allEntries.filter(
                    function(data) {

                        const date =
                            data.enteredAt.toDate();


                        return (
                            date.getFullYear() ===
                                year &&

                            date.getMonth() ===
                                month
                        );

                    }
                );


            displayGrouped(
                entries,
                "This Month",
                "Laboratory entries for the current month."
            );


            return;
        }


    } catch (error) {

        console.error(
            "Admin History Error:",
            error
        );


        historyHeading.textContent =
            "Unable to load history.";

        historyCount.textContent =
            "Please try again.";

    }

}


// =========================
// SINGLE DAY DISPLAY
// =========================

function displaySingleDay(
    entries,
    title,
    subtitle
) {

    historyHeading.textContent =
        title;


    historyTitle.textContent =
        subtitle;


    historyCount.textContent =
        "Total entries: " +
        entries.length;


    if (entries.length === 0) {

        historyEntries.innerHTML =
            `
            <div class="admin-card">
                <h2>No Entries</h2>
                <p>
                    No students entered the laboratory
                    on this date.
                </p>
            </div>
            `;

        return;
    }


    const date =
        entries[0].enteredAt.toDate();


    createDateSection(
        formatDate(date),
        entries
    );

}


// =========================
// GROUPED DISPLAY
// =========================

function displayGrouped(
    entries,
    title,
    subtitle
) {

    historyHeading.textContent =
        title;


    historyTitle.textContent =
        subtitle;


    historyCount.textContent =
        "Total entries: " +
        entries.length;


    if (entries.length === 0) {

        historyEntries.innerHTML =
            `
            <div class="admin-card">
                <h2>No Entries</h2>
                <p>
                    No laboratory entries found.
                </p>
            </div>
            `;

        return;
    }


    const groups = {};


    entries.forEach(
        function(data) {

            const date =
                data.enteredAt.toDate();


            const key =
                getDateKey(date);


            if (!groups[key]) {

                groups[key] = [];

            }


            groups[key].push(data);

        }
    );


    const dates =
        Object.keys(groups).sort(
            function(a, b) {

                return b.localeCompare(a);

            }
        );


    dates.forEach(
        function(dateKey) {

            const parts =
                dateKey.split("-");


            const date =
                new Date(
                    Number(parts[0]),
                    Number(parts[1]) - 1,
                    Number(parts[2])
                );


            createDateSection(
                formatDate(date),
                groups[dateKey]
            );

        }
    );

}


// =========================
// CREATE DATE SECTION
// =========================

function createDateSection(
    dateTitle,
    entries
) {

    const section =
        document.createElement(
            "section"
        );


    section.className =
        "history-date-section";


    const header =
        document.createElement(
            "div"
        );


    header.className =
        "history-date-header";


    const heading =
        document.createElement(
            "h2"
        );


    heading.textContent =
        dateTitle;


    const count =
        document.createElement(
            "span"
        );


    count.textContent =
        entries.length +
        (
            entries.length === 1
                ? " Student"
                : " Students"
        );


    header.appendChild(
        heading
    );


    header.appendChild(
        count
    );


    section.appendChild(
        header
    );


    // Sort latest first

    entries.sort(
        function(a, b) {

            return (
                b.enteredAt.toMillis() -
                a.enteredAt.toMillis()
            );

        }
    );


    entries.forEach(
        function(data, index) {

            const card =
                createEntryCard(
                    data,
                    index + 1
                );


            section.appendChild(
                card
            );

        }
    );


    historyEntries.appendChild(
        section
    );

}


// =========================
// CREATE ENTRY CARD
// =========================

function createEntryCard(
    data,
    number
) {

    const entry =
        document.createElement(
            "div"
        );


    entry.className =
        "admin-entry";


    const entryNumber =
        document.createElement(
            "div"
        );


    entryNumber.className =
        "admin-entry-number";


    entryNumber.textContent =
        String(number)
            .padStart(2, "0");


    const content =
        document.createElement(
            "div"
        );


    content.className =
        "admin-entry-content";


    const name =
        document.createElement(
            "h3"
        );


    name.textContent =
        data.name ||
        "Unknown Student";


    const details =
        document.createElement(
            "p"
        );


    details.textContent =
        (data.course ||
            "Unknown Course") +
        " • " +
        (data.year ||
            "Unknown Year") +
        " • ID: " +
        (data.studentId ||
            "Unknown ID");


    const time =
        document.createElement(
            "div"
        );


    time.className =
        "admin-entry-time";


    const date =
        data.enteredAt.toDate();


    time.textContent =
        date.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    content.appendChild(
        name
    );


    content.appendChild(
        details
    );


    entry.appendChild(
        entryNumber
    );


    entry.appendChild(
        content
    );


    entry.appendChild(
        time
    );


    return entry;

}