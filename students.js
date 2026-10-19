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


const studentsMessage =
    document.getElementById("studentsMessage");

const studentsList =
    document.getElementById("studentsList");


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


        studentsMessage.textContent =
            "Loading students...";


        try {

            const snapshot =
                await getDocs(
                    collection(
                        db,
                        "students"
                    )
                );


            studentsList.innerHTML = "";


            let students = [];


            snapshot.forEach(
                function(studentDoc) {

                    students.push(
                        studentDoc.data()
                    );

                }
            );


            // Sort alphabetically

            students.sort(
                function(a, b) {

                    return (
                        (a.name || "")
                            .localeCompare(
                                b.name || ""
                            )
                    );

                }
            );


            if (students.length === 0) {

                studentsMessage.textContent =
                    "No registered students found.";

                return;
            }


            studentsMessage.textContent =
                "Registered Students: " +
                students.length;


            // Create student cards

            students.forEach(
                function(student, index) {

                    const studentBox =
                        document.createElement(
                            "div"
                        );


                    studentBox.className =
                        "student-item";


                    // Number

                    const number =
                        document.createElement(
                            "div"
                        );

                    number.className =
                        "student-number";

                    number.textContent =
                        String(index + 1)
                            .padStart(2, "0");


                    // Student information

                    const info =
                        document.createElement(
                            "div"
                        );

                    info.className =
                        "student-info";


                    const name =
                        document.createElement(
                            "h3"
                        );

                    name.textContent =
                        student.name ||
                        "Unknown Student";


                    const details =
                        document.createElement(
                            "p"
                        );

                    details.textContent =
                        (student.course ||
                            "Unknown Course") +
                        " • " +
                        (student.year ||
                            "Unknown Year") +
                        " • ID: " +
                        (student.studentId ||
                            "Unknown ID");


                    info.appendChild(name);
                    info.appendChild(details);


                    // View details button

                    const viewButton =
                        document.createElement(
                            "a"
                        );

                    viewButton.className =
                        "student-view-button";

                    viewButton.textContent =
                        "View Details →";


                    const id =
                        encodeURIComponent(
                            student.studentId || ""
                        );


                    viewButton.href =
                        "student-details.html?id=" +
                        id;


                    // Add everything

                    studentBox.appendChild(
                        number
                    );

                    studentBox.appendChild(
                        info
                    );

                    studentBox.appendChild(
                        viewButton
                    );


                    studentsList.appendChild(
                        studentBox
                    );

                }
            );


        } catch (error) {

            console.error(
                "Students Error:",
                error
            );


            studentsMessage.textContent =
                "Unable to load students.";

        }

    }
);