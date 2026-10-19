import {
    getAuth,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

import { app } from "./firebase-config.js";


const auth = getAuth(app);


const loginForm =
    document.getElementById("loginForm");


const ADMIN_EMAIL =
    "sagarpetwal372@gmail.com";


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const email =
                document.getElementById("email")
                    .value
                    .trim();


            const password =
                document.getElementById("password")
                    .value;


            const loginMessage =
                document.getElementById("loginMessage");


            loginMessage.textContent =
                "Logging in...";


            try {

                const userCredential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    userCredential.user;


                loginMessage.textContent =
                    "Login successful!";


                // =========================
                // ADMIN LOGIN
                // =========================

                if (
                    user.email.trim().toLowerCase() ===
                    ADMIN_EMAIL.trim().toLowerCase()
                ) {

                    window.location.href =
                        "admin.html";

                    return;
                }


                // =========================
                // STUDENT LOGIN
                // =========================

                window.location.href =
                    "dashboard.html";


            } catch (error) {

                console.error(
                    "Login Error:",
                    error
                );


                if (
                    error.code ===
                    "auth/invalid-credential"
                ) {

                    loginMessage.textContent =
                        "Invalid email or password.";

                }

                else {

                    loginMessage.textContent =
                        "Error: " +
                        error.code;

                }

            }

        }
    );

}