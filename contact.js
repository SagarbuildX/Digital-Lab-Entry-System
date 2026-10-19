import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

import { app, db } from "./firebase-config.js";


const auth = getAuth(app);

const contactForm =
    document.getElementById("contactForm");

const contactMessage =
    document.getElementById("contactMessage");


let currentStudent = null;


// ================= AUTH CHECK =================

onAuthStateChanged(
    auth,
    async function(user) {

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        try {

            const studentRef =
                doc(
                    db,
                    "students",
                    user.uid
                );


            const studentSnap =
                await getDoc(studentRef);


            /*
             * Student documents in our project
             * are normally stored using Student ID.
             * So first we will search them by UID.
             */

            if (studentSnap.exists()) {

                currentStudent =
                    studentSnap.data();

            }

            else {

                const { query, where, getDocs } =
                    await import(
                        "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js"
                    );


                const studentQuery =
                    query(
                        collection(db, "students"),
                        where("uid", "==", user.uid)
                    );


                const result =
                    await getDocs(studentQuery);


                if (!result.empty) {

                    currentStudent =
                        result.docs[0].data();

                }

            }

        }

        catch (error) {

            console.error(
                "Student data error:",
                error
            );

        }

    }
);



// ================= SEND MESSAGE =================

contactForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const subject =
            document.getElementById("subject")
                .value
                .trim();


        const message =
            document.getElementById("message")
                .value
                .trim();


        if (subject === "") {

            contactMessage.textContent =
                "Please enter a subject.";

            return;
        }


        if (message === "") {

            contactMessage.textContent =
                "Please enter your message.";

            return;
        }


        contactMessage.textContent =
            "Sending your message...";


        try {

            const user =
                auth.currentUser;


            if (!user) {

                window.location.href =
                    "login.html";

                return;
            }


            await addDoc(
                collection(
                    db,
                    "supportMessages"
                ),
                {

                    uid: user.uid,

                    name:
                        currentStudent?.name ||
                        "Unknown Student",

                    studentId:
                        currentStudent?.studentId ||
                        "Unknown",

                    email:
                        user.email,

                    subject:
                        subject,

                    message:
                        message,

                    status:
                        "new",

                    createdAt:
                        serverTimestamp()

                }
            );


            contactMessage.textContent =
                "Your message has been sent successfully!";


            contactForm.reset();


        }

        catch (error) {

            console.error(
                "Firebase Error:",
                error
            );


            contactMessage.textContent =
                "Unable to send your message. Please try again.";

        }

    }
);