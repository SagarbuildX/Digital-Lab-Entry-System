import {
    getAuth,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

import { app } from "./firebase-config.js";


const auth = getAuth(app);

const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

const resetMessage =
    document.getElementById("resetMessage");


forgotPasswordForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const email =
            document.getElementById("email").value.trim();


        if (email === "") {

            resetMessage.textContent =
                "Please enter your registered email.";

            return;
        }


        resetMessage.textContent =
            "Sending reset email...";


        try {

            await sendPasswordResetEmail(
                auth,
                email
            );


            resetMessage.textContent =
                "Password reset email sent! Please check your email.";

        }

        catch (error) {

            console.error(
                "Firebase Error:",
                error
            );


            if (
                error.code ===
                "auth/invalid-email"
            ) {

                resetMessage.textContent =
                    "Please enter a valid email.";

            }

            else if (
                error.code ===
                "auth/user-not-found"
            ) {

                resetMessage.textContent =
                    "No account found with this email.";

            }

            else {

                resetMessage.textContent =
                    "Unable to send reset email. Please try again.";

            }

        }

    }
);