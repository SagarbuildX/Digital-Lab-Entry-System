import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

import { app, db } from "./firebase-config.js";

const auth = getAuth(app);

const historyMessage =
    document.getElementById("historyMessage");

const historyList =
    document.getElementById("historyList");


onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    historyMessage.textContent =
        "Loading your entry history...";

    historyList.innerHTML = "";


    try {

        const q = query(
            collection(db, "labEntries"),
            where("uid", "==", user.uid)
        );

        const snapshot = await getDocs(q);


        let entries = [];

        snapshot.forEach((docSnap) => {
            entries.push(docSnap.data());
        });


        // Latest entry first
        entries.sort((a, b) => {

            const aTime =
                a.enteredAt ? a.enteredAt.toMillis() : 0;

            const bTime =
                b.enteredAt ? b.enteredAt.toMillis() : 0;

            return bTime - aTime;
        });


        // No entries
        if (entries.length === 0) {

            historyMessage.textContent =
                "No lab entries found yet.";

            return;
        }


        historyMessage.textContent =
            "Total entries: " + entries.length;


        entries.forEach((data, index) => {

            const entry =
                document.createElement("div");

            entry.className = "history-entry";


            const number =
                document.createElement("div");

            number.className = "history-number";

            number.textContent =
                String(index + 1).padStart(2, "0");


            const content =
                document.createElement("div");

            content.className =
                "history-entry-content";


            const title =
                document.createElement("p");

            title.className =
                "history-entry-title";

            title.textContent =
                data.name || "Lab Entry";


            const dateText =
                document.createElement("p");

            dateText.className =
                "history-entry-date";


            const time =
                document.createElement("div");

            time.className =
                "history-entry-time";


            if (data.enteredAt) {

                const date =
                    data.enteredAt.toDate();


                dateText.textContent =
                    date.toLocaleDateString(
                        undefined,
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        }
                    );


                time.textContent =
                    date.toLocaleTimeString(
                        [],
                        {
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    );

            } else {

                dateText.textContent =
                    "Date unavailable";

                time.textContent =
                    "Time unavailable";
            }


            content.appendChild(title);

            content.appendChild(dateText);


            entry.appendChild(number);

            entry.appendChild(content);

            entry.appendChild(time);


            historyList.appendChild(entry);

        });


    } catch (error) {

        console.error(
            "History Error:",
            error
        );

        historyMessage.textContent =
            "Unable to load entry history.";
    }

});