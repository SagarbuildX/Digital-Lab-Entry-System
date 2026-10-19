import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

import { app, db } from "./firebase-config.js";


const auth = getAuth(app);


// =========================================================
// ELEMENTS
// =========================================================

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const profileStudentId =
    document.getElementById("profileStudentId");

const profileCourse =
    document.getElementById("profileCourse");

const profileYear =
    document.getElementById("profileYear");

const profileEmailDetail =
    document.getElementById("profileEmailDetail");

const profileMessage =
    document.getElementById("profileMessage");

const logoutButton =
    document.getElementById("logoutButton");


// =========================================================
// LOAD STUDENT PROFILE
// =========================================================

async function loadProfile(user) {

    try {

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

            profileMessage.textContent =
                "Student profile not found.";

            return;
        }


        let studentData = null;


        snapshot.forEach(
            function(studentDoc) {

                studentData =
                    studentDoc.data();

            }
        );


        // =================================================
        // DISPLAY PROFILE DATA
        // =================================================

        profileName.textContent =
            studentData.name || "Student";


        profileEmail.textContent =
            studentData.email || user.email || "—";


        profileStudentId.textContent =
            studentData.studentId || "—";


        profileCourse.textContent =
            studentData.course || "—";


        profileYear.textContent =
            studentData.year || "—";


        profileEmailDetail.textContent =
            studentData.email || user.email || "—";


        profileMessage.textContent =
            "";


    } catch (error) {

        console.error(
            "Profile Error:",
            error
        );


        profileMessage.textContent =
            "Unable to load profile details.";

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


        await loadProfile(user);

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


            profileMessage.textContent =
                "Unable to logout.";

        }

    }
);