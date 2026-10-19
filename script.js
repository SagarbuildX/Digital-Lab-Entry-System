import {
    getAuth,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

import { app, db } from "./firebase-config.js";


const auth = getAuth(app);


const registrationForm =
    document.getElementById("registrationForm");


if (registrationForm) {

    registrationForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const name =
                document.getElementById("name")
                    .value
                    .trim();


            const studentId =
                document.getElementById("studentId")
                    .value
                    .trim();


            const course =
                document.getElementById("course")
                    .value
                    .trim();


            const year =
                document.getElementById("year")
                    .value
                    .trim();


            const email =
                document.getElementById("email")
                    .value
                    .trim();


            const password =
                document.getElementById("password")
                    .value;


            const confirmPassword =
                document.getElementById("confirmPassword")
                    .value;


            const message =
                document.getElementById("message");


            // Basic validation

            if (name === "") {

                message.textContent =
                    "Please enter your full name.";

                return;
            }


            if (studentId === "") {

                message.textContent =
                    "Please enter your Student ID.";

                return;
            }


            if (course === "") {

                message.textContent =
                    "Please enter your course.";

                return;
            }


            if (year === "") {

                message.textContent =
                    "Please enter your year.";

                return;
            }


            if (email === "") {

                message.textContent =
                    "Please enter your email.";

                return;
            }


            if (password.length < 6) {

                message.textContent =
                    "Password must contain at least 6 characters.";

                return;
            }


            if (password !== confirmPassword) {

                message.textContent =
                    "Passwords do not match.";

                return;
            }


            message.textContent =
                "Creating your account...";


            try {

                // Create Firebase Authentication account

                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    userCredential.user;


                // Save student details in Firestore

                await setDoc(
                    doc(
                        db,
                        "students",
                        studentId
                    ),
                    {
                        uid: user.uid,

                        name: name,

                        studentId: studentId,

                        course: course,

                        year: year,

                        email: email,

                        createdAt: serverTimestamp()
                    }
                );


                message.textContent =
                    "Registration successful!";


            } catch (error) {

                console.error(
                    "Firebase Error:",
                    error
                );


                if (
                    error.code ===
                    "auth/email-already-in-use"
                ) {

                    message.textContent =
                        "This email is already registered.";

                }

                else if (
                    error.code ===
                    "auth/invalid-email"
                ) {

                    message.textContent =
                        "Please enter a valid email.";

                }

                else if (
                    error.code ===
                    "auth/weak-password"
                ) {

                    message.textContent =
                        "Password is too weak.";

                }

                else if (
                    error.code ===
                    "permission-denied"
                ) {

                    message.textContent =
                        "You do not have permission to register.";

                }

                else {

                    message.textContent =
                        "Error: " +
                        error.code +
                        " - " +
                        error.message;
                }

            }

        }
    );

}