// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAYT_CvHrO0sUFq79KFozyC_Z7lIXcV4jA",
    authDomain: "fightballth.firebaseapp.com",
    projectId: "fightballth",
    storageBucket: "fightballth.appspot.com",
    messagingSenderId: "776877320324",
    appId: "1:776877320324:web:a1ba82cffb5e5c20eabad1",
    measurementId: "G-DDEFEGJZLH"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM Elements
const categoryTables = document.getElementById("categoryTables");
const modal = document.getElementById("passwordModal");
const closeModal = document.querySelector(".close");
const saveButton = document.getElementById("saveButton");
const addMatchButton = document.getElementById("addMatchButton");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");

let currentRow;
let scheduleData = [];

// Fetch data from Firestore
async function fetchData() {
    const querySnapshot = await db.collection("matches").get();
    scheduleData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderTable(scheduleData);
}

// Add new match to Firestore
async function addMatch(newMatch) {
    await db.collection("matches").add(newMatch);
    fetchData();
}

// Update match in Firestore
async function updateMatch(id, updatedMatch) {
    const matchDoc = db.collection("matches").doc(id);
    await matchDoc.update(updatedMatch);
    fetchData();
}

// Delete match from Firestore
async function deleteMatch(id) {
    await db.collection("matches").doc(id).delete();
    fetchData();
}

function renderTable(data) {
    const categories = [...new Set(data.map(game => game.category))];
    categoryTables.innerHTML = '';

    categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        categoryDiv.setAttribute('data-category', category);

        const categoryTitle = document.createElement('h2');
        categoryTitle.textContent = category;
        categoryDiv.appendChild(categoryTitle);

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>#</th>
                    <th>Time</th>
                    <th>Home Team</th>
                    <th>Away Team</th>
                    <th>Stage</th>
                    <th>Result</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        categoryDiv.appendChild(table);
        categoryTables.appendChild(categoryDiv);

        const tbody = table.getElementsByTagName('tbody')[0];
        data.filter(game => game.category === category).forEach((game, index) => {
            const row = tbody.insertRow();
            const cellNumber = row.insertCell(0);
            const cellTime = row.insertCell(1);
            const cellHomeTeam = row.insertCell(2);
            const cellAwayTeam = row.insertCell(3);
            const cellStage = row.insertCell(4);
            const cellResult = row.insertCell(5);
            const cellActions = row.insertCell(6);

            cellNumber.textContent = index + 1;
            cellTime.textContent = game.time;
            cellHomeTeam.textContent = game.homeTeam;
            cellAwayTeam.textContent = game.awayTeam;
            cellStage.textContent = game.stage;
            cellResult.textContent = game.result;

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.className = "editButton";
            editButton.onclick = () => editRow(row, game.category);
            cellActions.appendChild(editButton);

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "deleteButton";
            deleteButton.onclick = () => deleteRow(game.id);
            cellActions.appendChild(deleteButton);
        });
    });
}

function editRow(row, category) {
    currentRow = row;
    for (let i = 1; i <= 5; i++) {
        const cell = row.cells[i];
        const input = document.createElement("input");
        input.type = "text";
        input.value = cell.textContent;
        cell.textContent = '';
        cell.appendChild(input);
    }
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.className = "saveButton";
    saveButton.onclick = () => showModal(category);
    row.cells[6].textContent = '';
    row.cells[6].appendChild(saveButton);
}

function showModal(category) {
    modal.style.display = "block";
    saveButton.onclick = function() {
        const password = document.getElementById("password").value;
        if (password === "papaman") { // Replace 'your_password' with the actual password you want to use
            saveRow(category);
            modal.style.display = "none";
        } else {
            alert("Incorrect password");
        }
    }
}

closeModal.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function saveRow(category) {
    const updatedMatch = {};
    for (let i = 1; i <= 5; i++) {
        const cell = currentRow.cells[i];
        const input = cell.querySelector("input");
        updatedMatch[i === 1 ? 'time' : i === 2 ? 'homeTeam' : i === 3 ? 'awayTeam' : i === 4 ? 'stage' : 'result'] = input.value;
        cell.textContent = input.value;
    }
    const matchId = scheduleData.find(match => match.category === category && match.number === parseInt(currentRow.cells[0].textContent)).id;
    updateMatch(matchId, updatedMatch);
}

function deleteRow(matchId) {
    deleteMatch(matchId);
}

addMatchButton.onclick = function() {
    const selectedCategory = categorySelect.value;
    const newMatch = {
        number: scheduleData.length + 1,
        time: "00:00",
        homeTeam: "New Home Team",
        awayTeam: "New Away Team",
        stage: "New Stage",
        result: "0-0",
        category: selectedCategory
    };
    addMatch(newMatch);
}

searchInput.addEventListener('input', function() {
    const searchValue = searchInput.value.toLowerCase();
    const filteredData = scheduleData.filter(game => 
        game.homeTeam.toLowerCase().includes(searchValue) || 
        game.awayTeam.toLowerCase().includes(searchValue)
    );
    renderTable(filteredData);
});

fetchData();
