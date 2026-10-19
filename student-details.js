import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

import { app, db } from "./firebase-config.js";


const auth = getAuth(app);

const studentDetails =
    document.getElementById("studentDetails");


const ADMIN_EMAIL =
    "sagarpetwal372@gmail.com";


// Check admin login

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


        // Get Student ID from URL

        const urlParams =
            new URLSearchParams(
                window.location.search
            );


        const studentId =
            urlParams.get("id");


        if (!studentId) {

            studentDetails.innerHTML =
                "<p>Student ID not found.</p>";

            return;
        }


        try {

            const studentRef =
                doc(
                    db,
                    "students",
                    studentId
                );


            const studentSnapshot =
                await getDoc(studentRef);


            if (!studentSnapshot.exists()) {

                studentDetails.innerHTML =
                    "<p>Student not found.</p>";

                return;
            }


            const student =
                studentSnapshot.data();


            // Student information

            studentDetails.innerHTML =

                "<div class='detail-grid'>" +

                    "<div class='detail-item'>" +
                        "<span>Full Name</span>" +
                        "<strong>" +
                            (student.name ||
                                "Unknown Student") +
                        "</strong>" +
                    "</div>" +

                    "<div class='detail-item'>" +
                        "<span>Student ID</span>" +
                        "<strong>" +
                            (student.studentId ||
                                "Unknown ID") +
                        "</strong>" +
                    "</div>" +

                    "<div class='detail-item'>" +
                        "<span>Course</span>" +
                        "<strong>" +
                            (student.course ||
                                "Unknown Course") +
                        "</strong>" +
                    "</div>" +

                    "<div class='detail-item'>" +
                        "<span>Year</span>" +
                        "<strong>" +
                            (student.year ||
                                "Unknown Year") +
                        "</strong>" +
                    "</div>" +

                    "<div class='detail-item detail-full'>" +
                        "<span>Email Address</span>" +
                        "<strong>" +
                            (student.email ||
                                "Unknown Email") +
                        "</strong>" +
                    "</div>" +

                "</div>";

        } catch (error) {

            console.error(
                "Student Details Error:",
                error
            );


            studentDetails.innerHTML =
                "<p>Unable to load student details.</p>";

        }

    }
);