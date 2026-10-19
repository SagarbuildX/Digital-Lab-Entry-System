import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    where,
    setDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

import { app, db } from "./firebase-config.js";


const auth = getAuth(app);


// =========================================================
// ELEMENTS
// =========================================================

const enterLabButton =
    document.getElementById("enterLabButton");

const historyButton =
    document.getElementById("historyButton");

const logoutButton =
    document.getElementById("logoutButton");

const entryMessage =
    document.getElementById("entryMessage");

const studentName =
    document.getElementById("studentName");

const todayVisits =
    document.getElementById("todayVisits");

const monthVisits =
    document.getElementById("monthVisits");

const totalVisits =
    document.getElementById("totalVisits");

const recentEntryDate =
    document.getElementById("recentEntryDate");

const recentEntryTime =
    document.getElementById("recentEntryTime");

const recentEntryStatus =
    document.getElementById("recentEntryStatus");


let currentUser = null;
let currentStudent = null;


// =========================================================
// GET TODAY'S DATE
// =========================================================

function getTodayDate() {

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(today.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(today.getDate())
            .padStart(2, "0");

    return year + "-" + month + "-" + day;
}


// =========================================================
// LOAD STUDENT PROFILE
// =========================================================

async function loadStudentProfile(user) {

    const studentQuery =
        query(
            collection(
                db,
                "students"
            ),
            where(
                "uid",
                "==",
                user.uid
            )
        );


    const snapshot =
        await getDocs(
            studentQuery
        );


    if (snapshot.empty) {

        return false;
    }


    snapshot.forEach(
        function(studentDoc) {

            currentStudent =
                studentDoc.data();

        }
    );


    // Show student's actual name

    if (
        studentName &&
        currentStudent.name
    ) {

        studentName.textContent =
            currentStudent.name;

    }


    return true;
}


// =========================================================
// LOAD LAB STATISTICS
// =========================================================

async function loadLabStats() {

    if (!currentUser) {
        return;
    }


    try {

        const entriesQuery =
            query(
                collection(
                    db,
                    "labEntries"
                ),
                where(
                    "uid",
                    "==",
                    currentUser.uid
                )
            );


        const snapshot =
            await getDocs(
                entriesQuery
            );


        const today =
            getTodayDate();


        const currentMonth =
            today.substring(0, 7);


        let todayCount = 0;

        let monthCount = 0;

        let totalCount =
            snapshot.size;


        snapshot.forEach(
            function(entryDoc) {

                const data =
                    entryDoc.data();

                const entryDate =
                    data.entryDate;


                // Today's visits

                if (
                    entryDate ===
                    today
                ) {

                    todayCount++;

                }


                // Current month's visits

                if (
                    entryDate &&
                    entryDate.substring(0, 7) ===
                    currentMonth
                ) {

                    monthCount++;

                }

            }
        );


        todayVisits.textContent =
            todayCount;

        monthVisits.textContent =
            monthCount;

        totalVisits.textContent =
            totalCount;


        // If already entered today

        if (todayCount > 0) {

            enterLabButton.disabled =
                true;

            entryMessage.textContent =
                "You have already entered the lab today.";

        }


    } catch (error) {

        console.error(
            "Stats Error:",
            error
        );

    }

}


// =========================================================
// LOAD RECENT LAB ENTRY
// =========================================================

async function loadRecentActivity() {

    if (!currentUser) {
        return;
    }


    try {

        const entriesQuery =
            query(
                collection(
                    db,
                    "labEntries"
                ),
                where(
                    "uid",
                    "==",
                    currentUser.uid
                )
            );


        const snapshot =
            await getDocs(
                entriesQuery
            );


        if (snapshot.empty) {

            recentEntryDate.textContent =
                "No entry yet";

            recentEntryTime.textContent =
                "—";

            recentEntryStatus.textContent =
                "No recent activity";

            return;
        }


        // Find latest entry

        let latestEntry = null;


        snapshot.forEach(
            function(entryDoc) {

                const data =
                    entryDoc.data();


                if (!latestEntry) {

                    latestEntry =
                        data;

                    return;
                }


                // Compare Firebase timestamps

                if (
                    data.enteredAt &&
                    latestEntry.enteredAt &&
                    data.enteredAt.seconds >
                    latestEntry.enteredAt.seconds
                ) {

                    latestEntry =
                        data;

                }

            }
        );


        if (!latestEntry) {
            return;
        }


        // Show date

        recentEntryDate.textContent =
            latestEntry.entryDate || "—";


        // Show time

        if (latestEntry.enteredAt) {

            const entryTime =
                latestEntry.enteredAt.toDate();


            recentEntryTime.textContent =
                entryTime.toLocaleTimeString(
                    "en-IN",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );

        } else {

            recentEntryTime.textContent =
                "—";

        }


        // Show status

        recentEntryStatus.textContent =
            "Lab Entry Recorded";


    } catch (error) {

        console.error(
            "Recent Activity Error:",
            error
        );

    }

}


// =========================================================
// CHECK LOGIN
// =========================================================

onAuthStateChanged(
    auth,
    async function(user) {

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        currentUser = user;


        try {

            // Load student profile

            const profileLoaded =
                await loadStudentProfile(user);


            if (!profileLoaded) {

                entryMessage.textContent =
                    "Student profile not found.";

                enterLabButton.disabled =
                    true;

                return;
            }


            // Profile successfully loaded

            entryMessage.textContent =
                "Ready to record your lab entry.";


            // Load statistics

            await loadLabStats();


            // Load recent activity

            await loadRecentActivity();


        } catch (error) {

            console.error(
                "Student Error:",
                error
            );


            entryMessage.textContent =
                "Unable to load student details.";

        }

    }
);


// =========================================================
// ENTER LAB
// =========================================================

enterLabButton.addEventListener(
    "click",
    async function() {

        if (
            !currentUser ||
            !currentStudent
        ) {

            entryMessage.textContent =
                "Please wait, loading your profile...";

            return;
        }


        enterLabButton.disabled =
            true;


        entryMessage.textContent =
            "Recording your entry...";


        try {

            const today =
                getTodayDate();


            // Check whether student already entered today

            const entriesQuery =
                query(
                    collection(
                        db,
                        "labEntries"
                    ),
                    where(
                        "uid",
                        "==",
                        currentUser.uid
                    )
                );


            const snapshot =
                await getDocs(
                    entriesQuery
                );


            let alreadyEntered =
                false;


            snapshot.forEach(
                function(entryDoc) {

                    const data =
                        entryDoc.data();


                    if (
                        data.entryDate ===
                        today
                    ) {

                        alreadyEntered =
                            true;

                    }

                }
            );


            if (alreadyEntered) {

                entryMessage.textContent =
                    "You have already entered the lab today.";

                enterLabButton.disabled =
                    true;

                return;
            }


            // Create one entry for this student today

            const entryId =
                currentUser.uid +
                "_" +
                today;


            await setDoc(
                doc(
                    db,
                    "labEntries",
                    entryId
                ),
                {

                    uid:
                        currentUser.uid,

                    name:
                        currentStudent.name,

                    studentId:
                        currentStudent.studentId,

                    course:
                        currentStudent.course,

                    year:
                        currentStudent.year,

                    email:
                        currentStudent.email,

                    entryDate:
                        today,

                    enteredAt:
                        serverTimestamp()

                }
            );


            entryMessage.textContent =
                "Lab entry recorded successfully!";


            // Update statistics

            await loadLabStats();


            // Update recent activity

            await loadRecentActivity();


        } catch (error) {

            console.error(
                "Lab Entry Error:",
                error
            );


            entryMessage.textContent =
                "Unable to record lab entry. Please try again.";


            enterLabButton.disabled =
                false;

        }

    }
);


// =========================================================
// ENTRY HISTORY
// =========================================================

historyButton.addEventListener(
    "click",
    function() {

        window.location.href =
            "history.html";

    }
);


// =========================================================
// LOGOUT
// =========================================================

logoutButton.addEventListener(
    "click",
    async function() {

        try {

            await signOut(auth);


            window.location.href =
                "login.html";


        } catch (error) {

            console.error(
                "Logout Error:",
                error
            );


            entryMessage.textContent =
                "Unable to logout.";

        }

    }
);


// =========================================================
// PROFILE BUTTON
// =========================================================

const profileButton =
    document.getElementById("profileButton");


if (profileButton) {

    profileButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "profile.html";

        }
    );

}