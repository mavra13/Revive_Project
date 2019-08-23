Vue.component('song-tr', {
    template: `<tr>
            <td>{{index+1}}</td>
            <td>{{song.fields.songName}}</td>
            <td>{{song.fields.composer}}</td>
            <td>{{song.fields.coCreators}}</td>
            <td>{{song.fields.Singers}}</td>
            <td>{{song.fields.beat}}</td>
            <td>{{song.fields.placeOfPublish}}</td>
            <td>{{song.fields.yearOfPublish}}</td>
            <td>` +
        `<a href="#" class="btn btn-danger btn-sm" @click="$emit('delete-requested')">x</a>
                <a href="#" class="btn btn-primary btn-sm" @click="$emit('edit-requested')">edit</a>
            </td>
        </tr>`,
    props: ['song', 'index']
})

Vue.component('singer-tr', {
    template: `<tr>
            <td>{{index+1}}</td>
            <td>{{singer.fields.singerName}}</td>
            <td>{{singer.fields.songs}}</td>
            <td>` +
        `<a href="#" class="btn btn-danger btn-sm" @click="$emit('delete-requested')">x</a>
        <a href="#" class="btn btn-primary btn-sm" @click="$emit('edit-requested')">edit</a>
            </td>
        </tr>`,
    props: ['singer', 'index']
})

Vue.component('song-card', {
    template: `<div class="card">
            <div class="card-header font-weight-bold">{{song.fields.songName}}</div>
            <div class="card-body">
                <p class="card-text"><span class="font-weight-bold mr-1">Συνθέτης:</span>{{song.fields.composer}}</p>
                <p class="card-text"><span class="font-weight-bold mr-1">Συνδημιουργοί:</span>{{song.fields.coCreators}}</p>
                <p class="card-text"><span class="font-weight-bold mr-1">Ερμηνευτές:</span>{{song.fields.Singers}}</p>
                <p class="card-text"><span class="font-weight-bold mr-1">Ρυθμός:</span>{{song.fields.beat}}</p>
                <p class="card-text"><span class="font-weight-bold mr-1">Τόπος Έκδοσης:</span>{{song.fields.placeOfPublish}}</p>
                <p class="card-text"><span class="font-weight-bold mr-1">Έτος Έκδοσης:</span>{{song.fields.yearOfPublish}}</p>
            </div>
        </div>`,
    props: ['song']
})
Vue.component('singer-card', {
    template: `<div class="card">
            <div class="card-header font-weight-bold">{{singer.fields.singerName}}</div>
            <div class="card-body">
                <p class="card-text"><span class="font-weight-bold mr-1">Τραγούδια:</span>{{singer.fields.songs}}</p>
            </div>
        </div>`,
    props: ['singer']
})

Vue.component('delete-modal', {
    template: `<div id="exampleModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
             aria-modal="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Προσοχή!</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"
                            @click="$emit('close-requested')">
                            <span aria-hidden="true">x</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>Θέλετε σίγουρα να διαγράψετε το στοιχείο από τη βάση δεδομένων;</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary"
                            @click="$emit('delete-requested')">Ναι</button>
                        <button type="button" class="btn btn-primary" data-dismiss="modal"
                            @click="$emit('close-requested')">Όχι</button>
                    </div>
                </div>
            </div>
        </div>`
})

let app = new Vue({
    el: '#songApp',
    data: {
        songs: [],
        singers: [],
        vSongs: [],
        vSingers: [],
        searchTermSongs: '',
        searchTermSingers: '',
        showModalSongs: false,
        showModalSingers: false,
        modalSong: {},
        modalSingersSelected: [],
        modalSongsSelected: [],
        modalSingers: {},
        showModDelSongs: false,
        modalDelSong: {},
        showModDelSingers: false,
        modalDelSinger: {}
    },
    created: function () {
        this.fetchSongs();
    },
    computed: {
        // filters the data of the table "Songs" based on a search term (it does not search to every field of the table)
        visibleSongs: function () {
            if (this.searchTermSongs !== "") {
                fetch('https://api.airtable.com/v0/app4twjd3G6rx5LM1/Songs?filterByFormula=OR(SEARCH(%22' + this.searchTermSongs +
                    '%22%2CsongName)%2CSEARCH(%22' + this.searchTermSongs + '%22%2CcoCreators)%2CSEARCH(%22' + this.searchTermSongs +
                    '%22%2Cbeat)%2CSEARCH(%22' + this.searchTermSongs + '%22%2CplaceOfPublish)%2CSEARCH(%22' + this.searchTermSongs +
                    '%22%2CyearOfPublish))', {
                        headers: {
                            'Authorization': 'Bearer keyrhl6HuVaE5rszk'
                        }
                    }).then(res => res.json()).then(res => {
                    app.vSongs = res.records;
                    // then we replace the singers ids (in the Songs table) with their names
                    for (let i = 0; i < app.vSongs.length; i++) {
                        app.vSongs[i].fields.Singers = app.singers.filter(g => g.fields.songs.indexOf(app.vSongs[i].fields.songName) > -1).map(g =>
                            g.fields.singerName).join(', ');
                    }
                });
                return this.vSongs; // returns the filtered table
            } else {
                return this.songs; // in case of empty search term returns the original table
            }
        },
        visibleSongsCount: function () {
            return this.visibleSongs.length;
        },
        // filters the data of the table "Singers" based on a search term
        visibleSingers: function () {
            if (this.searchTermSingers !== "") {
                fetch('https://api.airtable.com/v0/app4twjd3G6rx5LM1/Singers?filterByFormula=OR(SEARCH(%22' + this.searchTermSingers +
                    '%22%2CsingerName)%2CSEARCH(%22' + this.searchTermSingers + '%22%2Csongs))', {
                        headers: {
                            'Authorization': 'Bearer keyrhl6HuVaE5rszk'
                        }
                    }).then(res => res.json()).then(res => {
                    app.vSingers = res.records;
                    // once we have the Singers table data we replace the songs ids with their names
                    for (let i = 0; i < app.vSingers.length; i++) {
                        app.vSingers[i].fields.songs = app.songs.filter(g => g.fields.Singers.indexOf(app.vSingers[i].fields.singerName) > -1).map(g =>
                            g.fields.songName).join(', ');
                    }
                });
                return this.vSingers; // returns the filtered table
            } else {
                return this.singers; // in case of empty search term returns the original table
            }
        },
        visibleSingersCount: function () {
            return this.visibleSingers.length;
        }
    },
    methods: {
        // fetching the tables data from airtable through api calls
        fetchSongs: function () {
            fetch('https://api.airtable.com/v0/app4twjd3G6rx5LM1/Songs?maxRecords=pageSize&view=Grid%20view', {
                headers: {
                    'Authorization': 'Bearer keyrhl6HuVaE5rszk'
                }
            }).then(res => res.json()).then(res => {
                app.songs = res.records;

                this.fetchSingers();
                /* calling the fetchSingers function here insures that it is called after the fetchSongs function has been resolved.
                That way we make sure we have all the data from the related table in order to change the songs ids with their names*/
            });
        },
        fetchSingers: function () {
            fetch('https://api.airtable.com/v0/app4twjd3G6rx5LM1/Singers?maxRecords=pageSize&view=Grid%20view', {
                headers: {
                    'Authorization': 'Bearer keyrhl6HuVaE5rszk'
                }
            }).then(res => res.json()).then(res => {
                app.singers = res.records;
                // once we have the Singers table data we replace the songs ids with their names
                for (let i = 0; i < app.singers.length; i++) {
                    app.singers[i].fields.songs = app.songs.filter(g => g.fields.Singers.indexOf(app.singers[i].id) > -1).map(g =>
                        g.fields.songName).join(', ');
                }
                // then we replace the singers ids (in the Songs table) with their names
                for (let i = 0; i < app.songs.length; i++) {
                    app.songs[i].fields.Singers = app.singers.filter(g => g.fields.songs.indexOf(app.songs[i].fields.songName) > -1).map(g =>
                        g.fields.singerName).join(', ');
                }
            });
        },
        /* sorting fields through api calls or locally in case the fields data returnd are in ID form (table: Songs -> field: Singers, 
            table: Singers -> field: songs)*/
        sortSongName: function () {
            fetch('https://api.airtable.com/v0/app4twjd3G6rx5LM1/Songs?sort%5B0%5D%5Bfield%5D=songName&sort%5B0%5D%5Bdirection%5D=asc', {
                headers: {
                    'Authorization': 'Bearer keyrhl6HuVaE5rszk'
                }
            }).then(res => res.json()).then(res => {
                app.songs = res.records;
                for (let i = 0; i < app.songs.length; i++) {
                    app.songs[i].fields.Singers = app.singers.filter(g => g.fields.songs.indexOf(app.songs[i].fields.songName) > -1).map(g =>
                        g.fields.singerName).join(', ');
                }
            });
        },
        sortcoComposer: function () {
            fetch('https://api.airtable.com/v0/app4twjd3G6rx5LM1/Songs?sort%5B0%5D%5Bfield%5D=coCreators&sort%5B0%5D%5Bdirection%5D=asc', {
                headers: {
                    'Authorization': 'Bearer keyrhl6HuVaE5rszk'
                }
            }).then(res => res.json()).then(res => {
                app.songs = res.records;
                for (let i = 0; i < app.songs.length; i++) {
                    app.songs[i].fields.Singers = app.singers.filter(g => g.fields.songs.indexOf(app.songs[i].fields.songName) > -1).map(g =>
                        g.fields.singerName).join(', ');
                }
            });
        },
        sortsingers: function () {
            this.visibleSongs.sort((a, b) => {
                if (a.fields.Singers > b.fields.Singers) return 1;
                if (a.fields.Singers < b.fields.Singers) return -1;
                return 0;
            });
        },
        sortyearOfPublish: function () {
            fetch('https://api.airtable.com/v0/app4twjd3G6rx5LM1/Songs?sort%5B0%5D%5Bfield%5D=yearOfPublish&sort%5B0%5D%5Bdirection%5D=asc', {
                headers: {
                    'Authorization': 'Bearer keyrhl6HuVaE5rszk'
                }
            }).then(res => res.json()).then(res => {
                app.songs = res.records;
                for (let i = 0; i < app.songs.length; i++) {
                    app.songs[i].fields.Singers = app.singers.filter(g => g.fields.songs.indexOf(app.songs[i].fields.songName) > -1).map(g =>
                        g.fields.singerName).join(', ');
                }
            });
        },
        sortsingerName: function () {
            fetch('https://api.airtable.com/v0/app4twjd3G6rx5LM1/Singers?sort%5B0%5D%5Bfield%5D=singerName&sort%5B0%5D%5Bdirection%5D=asc', {
                headers: {
                    'Authorization': 'Bearer keyrhl6HuVaE5rszk'
                }
            }).then(res => res.json()).then(res => {
                app.singers = res.records;

                for (let i = 0; i < app.singers.length; i++) {
                    app.singers[i].fields.songs = app.songs.filter(g => g.fields.Singers.indexOf(app.singers[i].fields.singerName) > -1).map(g =>
                        g.fields.songName).join(', ');
                }
            });
        },
        sortsongs: function () {
            this.visibleSingers.sort((a, b) => {
                if (a.fields.songs > b.fields.songs) return 1;
                if (a.fields.songs < b.fields.songs) return -1;
                return 0;
            });
        },
        // clears the search box when the button "Clear" is pressed
        clearSearch: function () {
            this.searchTermSongs = '';
            this.searchTermSingers = '';
        },
        /* closes the edit/addNew modal for songs table when either button "x" or button "close" is pressed (whithout making any changes)
        or when it is called from within another function*/
        closeModalSongs: function () {
            this.showModalSongs = false;
        },
        /* closes the edit/addNew modal for singers table when either button "x" or button "close" is pressed (whithout making any changes)
        or when it is called from within another function*/
        closeModalSingers: function () {
            this.showModalSingers = false;
        },
        // opens the edit/addNew modal for songs table when the "+" button is pressed
        addSong: function () {
            this.modalSong = {}; // clears the app.modalSong variable from any previous edit/addNew song data
            this.showModalSongs = true;
        },
        // opens the edit/addNew modal for singers table when the "+" button is pressed
        addSinger: function () {
            this.modalSingers = {}; // clears the app.modalSingers variable from any previous edit/addNew singer data
            this.showModalSingers = true;
        },
        // opens the edit/addNew modal for songs table when the "edit" button is pressed
        editSong: function (s) {
            this.modalSong = Object.assign({}, s.fields);
            /* assigns the data from the song we want to edit to the app.modalSong variable 
                       so the data will be displayed in the modal*/
            this.modalSong.singers = s.fields.Singers
            this.modalSong.id = s.id; // stores the song id in the app.modalSong variable for later use
            this.showModalSongs = true;
        },
        // opens the edit/addNew modal for singers table when the "edit" button is pressed
        editSinger: function (s) {
            this.modalSingers = Object.assign({}, s.fields);
            /* assigns the data from the singer we want to edit to the app.modalSingers variable 
                       so the data will be displayed in the modal*/
            this.modalSingers.id = s.id; // stores the singers id in the app.modalSingers variable for later use
            this.showModalSingers = true;
        },
        // activated when the "+" button (in the edit/addNew modal for songs table) is pressed
        addSingersButton: function () {
            if (this.modalSong.singers === undefined || this.modalSong.singers === "") { //checks if the app.modalSong.Singers var. has no value
                this.modalSong.singers = this.modalSingersSelected // assigns the selection of the singers dropdown list to the app.modalSong.singers var.
                this.modalSingersSelected = ""; // clears the app.modalSingersSelected var.
            } else {
                this.modalSong.singers += ", " + this.modalSingersSelected
                /* if the app.modalSong.Singers var. has already a value it adds "," 
                               and then the selection of the singers dropdown list*/
                this.modalSingersSelected = "";
            }
        },
        // activated when the "+" button (in the edit/addNew modal for singers table) is pressed
        addSongsButton: function () {
            if (this.modalSingers.songs === undefined || this.modalSingers.songs === "") { //checks if the app.modalSingers.songs var. has no value
                this.modalSingers.songs = this.modalSongsSelected // assigns the selection of the songs dropdown list to the app.modalSingers.songs var.
                this.modalSongsSelected = ""; // clears the app.modalSongsSelected var.
            } else {
                this.modalSingers.songs += ", " + this.modalSongsSelected
                /* if the app.modalSingers.songs var. has already a value it adds "," 
                               and then the selection of the songs dropdown list*/
                this.modalSongsSelected = "";
            }
        },
        // activated when the "-" button (in the edit/addNew modal for singers table) is pressed
        removeSongsButton: function () {
            let s = this.modalSongsSelected + ", ";
            this.modalSingers.songs = this.modalSingers.songs.replace(s, ''); // removes the selection of the songs dropdown list from the app.modalSingers.songs var.
            this.modalSongsSelected = ""; // clears the app.modalSongsSelected var.

        },
        // saves the edited song or creates a new record to the "Songs" table when activated. It is called in the saveModal function
        saveSong: function () {
            let idUrl = '';
            let fields = Object.assign({}, app.modalSong); // assigns the app.modalSong data to the fields var.
            let method = 'POST'; // we need 'POST' to create new record
            delete fields.singers; // we delete the singers field from the fields var.
            if (app.modalSong.id) {
                /* in case the app.modalSong data include an id we store it in the idUrl var. and change the method var. to
                               'PUT' to update an existing record*/
                idUrl = '/' + app.modalSong.id;
                method = 'PUT';
                delete fields.id; // we delete the id from the fields var. (we only need it for the construction of the url)
            }
            fetch('https://api.airtable.com/v0/app4twjd3G6rx5LM1/Songs' + idUrl, {
                method: method,
                headers: {
                    'Authorization': 'Bearer keyrhl6HuVaE5rszk',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fields: fields
                })
            }).then(res => res.json()).then(res => {
                // in case of a new song: we store the created id to the app.modalSong.id var. for later use
                app.modalSong.id = [res.id];
                // in case of a new song: if the singer exists the following will assign the new song to the singer (app.singers.fields.songs=> releted field)
                let losngr = app.modalSong.singers.split(", ");
                losngr.forEach(function (l) {
                    app.singers.filter(g => g.fields.singerName.indexOf(l) > -1).map(g => {
                        if (g.fields.songs === "" || g.fields.songs === undefined) {
                            g.fields.songs = app.modalSong.songName;
                        } else {
                            g.fields.songs += ", " + app.modalSong.songName;
                        }
                    });
                })
                
                if (idUrl === '') { // idUrl var. is empty when the song in new
                    app.songs.push(res); // if the song is new we add it to the app.songs var.
                    
                }
            });
        },
        // activated when the "Save changes" button of the "Songs" table edit/addNew modal is pressed
        saveModal: function () {
            let method = 'POST'; // we need 'POST' to create new record
            let list = [];

            // the following compiles a list of the singers names
            app.singers.forEach(function (g) {
                list.push(g.fields.singerName);
            });

            let losngr = this.modalSong.singers.split(", ");
            app.modalSong.Singers = [];
            losngr.forEach(function (l) {
                if (list.includes(l)) { // if the list var. includes the name of the singer we push the id of the singer in the app.modalSong.Singers var.
                    let j = app.singers.filter(g => g.fields.singerName.indexOf(l) > -1).map(g => g.id);
                    app.modalSong.Singers.push(j[0]);
                    app.saveSong();
                } else {
                    // if the list var. does not include the name of the singer we have to also create a new record to the "Singers" table
                    let fields = {
                        "singerName": l,
                    }
                    fetch('https://api.airtable.com/v0/app4twjd3G6rx5LM1/Singers', {
                        method: method,
                        headers: {
                            'Authorization': 'Bearer keyrhl6HuVaE5rszk',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            fields: fields
                        })
                    }).then(res => res.json()).then(res => {
                        // after creating the new record to the "Singers" table we add it to the app.singers var.
                        app.singers.push(res);
                        console.log(res);
                        list.push(res.fields.singerName);
                        app.modalSong.Singers.push(res.id);
                        /* we add the new records id to the app.modalSong.Singers var. (needed to add the data of the 
                                           related field in the following saveSong function call*/
                        app.saveSong();
                    });
                }
            })
            this.closeModalSongs();
            app.fetchSongs();
        },
        // activated when the "Save changes" button of the "Singers" table edit/addNew modal is pressed
        saveSingerModal: function () {
            let idUrl = '';
            let fields = Object.assign({}, app.modalSingers); // assigns the app.modalSingers data to the fields var.
            let method = 'POST'; // we need 'POST' to create new record
            // the following stores the array of the songs ids to the fields.songs var.
            let losongs = this.modalSingers.songs.split(", ");
            losongs.forEach(function (l) {
                fields.songs = app.songs.filter(g => g.fields.songName.indexOf(l) > -1).map(g => g.id);
            });

            if (app.modalSingers.id) {
                /* in case the app.modalSingers data include an id we store it in the idUrl var. and change the method var. to
                                   'PUT' to update an existing record*/
                idUrl = '/' + app.modalSingers.id;
                method = 'PUT';
                delete fields.id; // we also delete the id from the fields var. (we only need it for the construction of the url)
            }
            fetch('https://api.airtable.com/v0/app4twjd3G6rx5LM1/Singers' + idUrl, {
                method: method,
                headers: {
                    'Authorization': 'Bearer keyrhl6HuVaE5rszk',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fields: fields
                })
            }).then(res => res.json()).then(res => {
                this.closeModalSingers();
                if (idUrl === '') { // idUrl var. is empty when the song in new
                    app.singers.push(res); // if the song is new we add it to the app.songs var.
                }
                this.fetchSongs();
            });
        },
        /* closes the delete modal for songs table when either button "x" or button "close" is pressed (whithout making any changes)
         or when it is called from within another function*/
        closeModDelSongs: function () {
            this.showModDelSongs = false;
        },
        /* closes the delete modal for songs table when either button "x" or button "close" is pressed (whithout making any changes)
         or when it is called from within another function*/
        closeModDelSingers: function () {
            this.showModDelSingers = false;
        },
        // opens the delete verification modal for songs table when the "x" button is pressed
        deleteSongVer: function (s) {
            this.modalDelSong = Object.assign({}, s); // assigns the data from the song we want to delete to the app.modalDelSong var.
            this.showModDelSongs = true;
        },
        // opens the delete verification modal for singers table when the "x" button is pressed
        deleteSingerVer: function (s) {
            this.modalDelSinger = Object.assign({}, s); // assigns the data from the singer we want to delete to the app.modalDelSinger var.
            this.showModDelSingers = true;
        },
        // when the yes button is pressed it deletes the song from the database through an api call
        deleteSong: function (s) {
            fetch('https://api.airtable.com/v0/app4twjd3G6rx5LM1/Songs' + '/' + s.id, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer keyrhl6HuVaE5rszk'
                }
            }).then(res => res.json()).then(res => {
                if (res.deleted) {
                    const idx = this.songs.findIndex(i => i.id === s.id);
                    if (idx > -1) {
                        this.songs.splice(idx, 1);
                    }
                } else {
                    alert('Could not delete song!');
                }
                this.closeModDelSongs();
                this.modalDelSong = {};
                this.fetchSongs();
            });
        },
        // when it is called in the deleteSinger function it deletes the singer from the database through an api call
        delSinger: function (s) {
            fetch('https://api.airtable.com/v0/app4twjd3G6rx5LM1/Singers' + '/' + s.id, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer keyrhl6HuVaE5rszk'
                }
            }).then(res => res.json()).then(res => {
                if (res.deleted) {
                    const idx = this.singers.findIndex(i => i.id === s.id);
                    if (idx > -1) {
                        this.singers.splice(idx, 1);
                    }
                } else {
                    alert('Could not delete singer!');
                }
                this.closeModDelSingers();
                this.modalDelSinger = {};
                this.fetchSongs();
            })
        },
        // when the yes button is pressed it desides whether to delete the singer (and maybe the song) or not
        deleteSinger: function (s) {
            let countSongs = this.modalDelSinger.fields.songs.split(", ");
            // checks if the singer is assigned to more than one songs
            if (countSongs.length > 1) { // if it is it does not delete the singer
                alert("Cannot delete. The singer is assigned to multiple songs.");
                this.closeModDelSingers();
                this.modalDelSinger = {};
            } else { // if it isn't it checks how many singers are assigned to the song

                if (countSongs[0] === "") { // if it isn't assigned to any song it deletes the (selected) singer
                    this.delSinger(s);
                } else {
                    let song = {};
                    for (let i = 0; i < this.songs.length; i++) {
                        if (this.songs[i].fields.songName.includes(this.modalDelSinger.fields.songs)) {
                            song = this.songs[i];
                            continue;
                        }
                    }
                    let countSingers = song.fields.Singers.split(", ");
                    if (countSingers.length > 1) { //if there are more than one singers assigned to the song it only deletes the (selected) singer
                        this.delSinger(s);
                    } else { //if there is only one singer (therefor the selected one) it deletes the song and then the singer
                        fetch('https://api.airtable.com/v0/app4twjd3G6rx5LM1/Songs' + '/' + song.id, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': 'Bearer keyrhl6HuVaE5rszk'
                            }
                        }).then(res => res.json()).then(res => {
                            if (res.deleted) {
                                const idx = this.songs.findIndex(i => i.id === song.id);
                                if (idx > -1) {
                                    this.songs.splice(idx, 1);
                                }
                            } else {
                                alert('Could not delete song!');
                            }
                            this.delSinger(s);
                        })
                    }
                }
            }
        }
    }
});