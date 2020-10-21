window.fn = {};

window.fn.open = function () {
    var menu = document.getElementById('menu');
    menu.open();
};

window.fn.load = function (page) {
    var content = document.getElementById('content');
    var menu = document.getElementById('menu');
    content.load(page)
        .then(menu.close.bind(menu));
};


document.addEventListener('init', function (event) {
    if (event.target.id === "home") {
        openDb();
        getProjects();
    }
});


var db = null;

function onError(tx, e) {
    alert(`Quelque chose n'a pas marché : ${e.Message}`);
}

function onSuccess(tx, r) {
    getProjects();
}

function openDb() {
    db = openDatabase("Hackathon", "1", "Hackathon app", 1024 * 1024);

    db.transaction(function (tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS projects (ID INTEGER PRIMARY KEY ASC, nom VARCHAR, prenom VARCHAR, titre VARCHAR, desc TEXT)", []);
    });
}

function getProjects() {
    db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM projects", [], renderProjects, onError);
    });
}

function getProject(id) {
    db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM projects WHERE ID=?", [id], renderProject, onError);
    });
}

function renderProjects(tx, rs) {
    var output = "";
    var list = document.getElementById("ProjectList");

    for (i = 0; i < rs.rows.length; i++) {
        var row = rs.rows.item(i);
        output += `<ons-list-item>
                        <div class="left">
                            <img class="list-item__thumbnail" src="https://placekitten.com/g/40/40">
                        </div>
                        <div class="center" onClick="getProject(${row.ID})">
                            <span class="list-item__title">${row.titre}</span><span class="list-item__subtitle">${row.nom} ${row.prenom}</span>
                        </div>                        
                        <div class="right">
                            <ons-button onClick="deleteItem(${row.ID})">
                                <ons-icon icon="trash"></ons-icon>
                            </ons-button>
                        </div>
                    </ons-list-item>`;
    }

    list.innerHTML = output;
}

function renderProject(tx, rs) {
    var projectInfo = document.getElementById("detail.html");

    var data = rs.rows[0];

    var output = `<ons-page id="home">
                        <ons-toolbar>
                            <div class="left">
                                <ons-toolbar-button onclick="fn.open()">
                                    <ons-icon icon="md-menu"></ons-icon>
                                </ons-toolbar-button>
                            </div>
                            <div class="center">
                                Détails
                            </div>
                        </ons-toolbar>

                        <div style="text-align: center; margin-top: 30px;">
                            <ons-list modifier="inset">
                                <ons-list-header>Nom & Prénoms</ons-list-header>
                                <ons-list-item modifier="longdivider">${data.nom} ${data.prenom}</ons-list-item>
                            </ons-list>
                        </div>
                        <br />
                        <div style="height: 200px; padding: 1px 0 0 0;">
                            <div class="card card--material">
                                <div class="card__title card--material__title">${data.titre}</div>
                                <div class="card__content card--material__content">${data.desc}</div>
                            </div>
                        </div>
                    </ons-page>`;

    projectInfo.innerHTML = output;
}

function addProject() {
    var nom = document.getElementById("nom").value;
    var prenom = document.getElementById("prenom").value;
    var titre = document.getElementById("titre").value;
    var desc = document.getElementById("desc").value;

    db.transaction(function (tx) {
        tx.executeSql("INSERT INTO projects (nom, prenom, titre, desc) VALUES (?,?,?,?)", [nom, prenom, titre, desc], onSuccess, onError);
    });

    fn.load('home.html');
}

function deleteItem(id) {
    db.transaction(function (tx) {
        tx.executeSql("DELETE FROM projects WHERE ID=?", [id], onSuccess, onError);
    });
}