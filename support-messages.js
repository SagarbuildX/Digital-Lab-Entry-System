import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { app, db } from "./firebase-config.js";


const auth = getAuth(app);

const ADMIN_EMAIL =
    "sagarpetwal372@gmail.com";


const messagesList =
    document.getElementById("messagesList");

const messageCount =
    document.getElementById("messageCount");


const allButton =
    document.getElementById("allButton");

const newButton =
    document.getElementById("newButton");

const resolvedButton =
    document.getElementById("resolvedButton");


let allMessages = [];

let currentFilter = "all";



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


        if (user.email !== ADMIN_EMAIL) {

            alert(
                "You are not authorized to access this page."
            );

            window.location.href =
                "dashboard.html";

            return;
        }


        await loadMessages();

    }
);



// =========================
// LOAD MESSAGES
// =========================

async function loadMessages() {

    try {

        const messagesQuery =
            query(
                collection(
                    db,
                    "supportMessages"
                ),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(messagesQuery);


        allMessages =
            snapshot.docs.map(
                function(document) {

                    return {
                        id: document.id,
                        ...document.data()
                    };

                }
            );


        renderMessages();

    }

    catch (error) {

        console.error(
            "Error loading messages:",
            error
        );


        messagesList.innerHTML = `
            <p class="admin-message">
                Unable to load student queries.
            </p>
        `;

        messageCount.textContent =
            "Unable to load messages.";

    }

}



// =========================
// RENDER MESSAGES
// =========================

function renderMessages() {

    let filteredMessages =
        allMessages;


    if (currentFilter === "new") {

        filteredMessages =
            allMessages.filter(
                function(message) {

                    return message.status === "new";

                }
            );

    }


    if (currentFilter === "resolved") {

        filteredMessages =
            allMessages.filter(
                function(message) {

                    return message.status === "resolved";

                }
            );

    }


    messageCount.textContent =
        `${filteredMessages.length} message(s) found`;


    if (filteredMessages.length === 0) {

        messagesList.innerHTML = `
            <div class="admin-card">
                <p class="admin-message">
                    No messages found.
                </p>
            </div>
        `;

        return;

    }


    messagesList.innerHTML = "";


    filteredMessages.forEach(
        function(message) {

            const card =
                document.createElement("div");


            card.className =
                "admin-card support-message-card";


            const status =
                message.status === "resolved"
                    ? "🟢 Resolved"
                    : "🔴 New";


            const date =
                message.createdAt
                    ? message.createdAt
                        .toDate()
                        .toLocaleString(
                            "en-IN",
                            {
                                dateStyle: "medium",
                                timeStyle: "short"
                            }
                        )
                    : "Date unavailable";


            card.innerHTML = `

                <div class="admin-card-header">

                    <div>

                        <span class="message-status">
                            ${status}
                        </span>

                        <h2>
                            ${escapeHTML(
                                message.subject ||
                                "No Subject"
                            )}
                        </h2>

                        <p>
                            ${escapeHTML(
                                message.name ||
                                "Unknown Student"
                            )}
                            •
                            Student ID:
                            ${escapeHTML(
                                message.studentId ||
                                "Unknown"
                            )}
                        </p>

                    </div>

                    <div class="admin-card-icon">
                        💬
                    </div>

                </div>


                <div class="support-message-info">

                    <p>
                        <strong>Email:</strong>
                        ${escapeHTML(
                            message.email ||
                            "Unknown"
                        )}
                    </p>

                    <p>
                        <strong>Date:</strong>
                        ${date}
                    </p>

                </div>


                <div class="support-message-body">

                    <strong>
                        Message
                    </strong>

                    <p>
                        ${escapeHTML(
                            message.message ||
                            "No message"
                        )}
                    </p>

                </div>


                <button
                    class="admin-secondary-button resolve-button"
                    data-id="${message.id}"
                    ${message.status === "resolved"
                        ? "disabled"
                        : ""}>

                    ${message.status === "resolved"
                        ? "✓ Resolved"
                        : "Mark as Resolved →"}

                </button>

            `;


            messagesList.appendChild(card);

        }
    );

}



// =========================
// FILTER BUTTONS
// =========================

allButton.addEventListener(
    "click",
    function() {

        currentFilter = "all";

        setActiveButton(allButton);

        renderMessages();

    }
);


newButton.addEventListener(
    "click",
    function() {

        currentFilter = "new";

        setActiveButton(newButton);

        renderMessages();

    }
);


resolvedButton.addEventListener(
    "click",
    function() {

        currentFilter = "resolved";

        setActiveButton(resolvedButton);

        renderMessages();

    }
);



// =========================
// ACTIVE FILTER
// =========================

function setActiveButton(activeButton) {

    allButton.classList.remove("active");

    newButton.classList.remove("active");

    resolvedButton.classList.remove("active");


    activeButton.classList.add("active");

}



// =========================
// HTML SAFETY
// =========================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =========================
// MARK AS RESOLVED
// =========================

messagesList.addEventListener(
    "click",
    async function(event) {

        const button =
            event.target.closest(
                ".resolve-button"
            );


        if (!button) {
            return;
        }


        const messageId =
            button.dataset.id;


        if (!messageId) {
            return;
        }


        const confirmResolve =
            confirm(
                "Mark this student query as resolved?"
            );


        if (!confirmResolve) {
            return;
        }


        button.disabled = true;

        button.textContent =
            "Updating...";


        try {

            await updateDoc(
                doc(
                    db,
                    "supportMessages",
                    messageId
                ),
                {
                    status: "resolved"
                }
            );


            // Update local data
            const message =
                allMessages.find(
                    function(item) {
                        return item.id === messageId;
                    }
                );


            if (message) {
                message.status = "resolved";
            }


            renderMessages();


        }

        catch (error) {

            console.error(
                "Resolve Error:",
                error
            );


            button.disabled = false;

            button.textContent =
                "Mark as Resolved →";


            alert(
                "Unable to update the message. Please try again."
            );

        }

    }
);