

if(!localStorage.getItem('isLogged')){ 
    window.location.href = "./login.html"
    console.log('no estas logeado')
    
}else{
    console.log("Bienvenido")
}
    /* Para hacer log out... */ 
    const logoutBtn = document.getElementById('logout')
    logoutBtn.addEventListener('click', () => {
        console.log("salir")
        localStorage.removeItem('isLogged')
        localStorage.removeItem('userName')
        window.location.href = "./login.html"
    })
    
    /* Para mostrar el nombre de usuario en el navbar, una vez loggeado */
    let user = localStorage.getItem('userName')
    let userTitle = document.getElementById('userTitle')
    userTitle.innerText = user
    
    const audio = document.getElementById("audio");


    /* Definir clases */
    class Song{
        constructor({id, name, artist, duration, album, gender, year, isFav = false, onPlayList = false, urlCover, urlSong}){
            this.id = id;
            this.name = name;
            this.artist = artist;
            this.duration = duration;
            this.album = album;
            this.gender = gender;
            this.year = year;
            this.isFav = isFav;
            this.onPlayList = onPlayList;
    
            this.urlCover = urlCover;
            this.urlSong = urlSong;
        }
    
        getName(){
            return(this.name);
        };
    
        getArtist(){
            return(this.artist);
        }

        // Añadir los métodos que faltan, por c/atributo de la clase
    }
    
    class Playlist{
        constructor({listName, container, songs = []}){
            this.listName = listName;
            this.container = container;
            this.songs = songs;
        }
    
        addSong(...song){
            this.songs.push(...song)
            this.renderList()// Por c/vez que agreguemos una nueva canción a la lista, el html que muestra la lista se actualiza, y se muestra todo menos la canción borrada

            
        }
        removeSong(song){
            const index = this.songs.indexOf(song);
            if (index === -1) return // Esto indica que no encontró la canción
            this.songs.splice(index, 1) // Si existe la canción, se borra usando su posición(index), solo ese elemento ('1')
            this.renderList(); 
            
        }
        
        renderList(lista = this.songs, container = this.container, listName = this.listName){
            let contenedor = document.getElementById(container);
            /* Muestra todas las canciones de la lista en cuestión */
            contenedor.innerHTML = "";
            /* console.log("resultados búsqueda", lista) */
            lista.forEach(
                song => {
                    let favIcon = ""
                    let playListIcon = "" 

                    if(song.onPlayList){
                        playListIcon = "fa fa-minus-circle" // icono +
                    }else{
                        playListIcon = "fa-solid fa-plus" // icono -
                    }

                    if(song.isFav){
                        favIcon = "fa fa-heart" // icono añadir
                    }else{
                        favIcon = "fa-regular fa-heart" // icono quitar
                    }

                    contenedor.innerHTML += `<li><h3 onClick='changeCurrentSong(${song.id}, ${JSON.stringify(lista)})' class="cancion" data-idSong=${song.id}>${song.name}</h3><i id="playlist${song.id}${listName}"  class="${playListIcon}"></i><i  id="favs${song.id}${listName}" class="${favIcon}"></i></li>`  
                });

            lista.forEach(song => {
                document.getElementById(`playlist${song.id}${listName}`).addEventListener('click', () => {
                    // Aquí va el código para añadir la canción a la lista de reproducción
                    if(!song.onPlayList){
                        myPlaylist.addSong(song);
                        song.onPlayList = true;
                    }else{
                        song.onPlayList = false
                        myPlaylist.removeSong(song)
                    }
                    biblioGeneral.renderList()
                    myFavorite.renderList()
                    myPlaylist.renderList()

                    if(musicPlayer.currentPlayList){
                        musicPlayer.removePlayList()
                    }
                    musicPlayer.addPlayList(...myPlaylist.songs)
                    console.log("Deberian quedar:",myPlaylist.songs)
                    console.log("En realidad están en music player", musicPlayer.currentPlayList)
                });
                document.getElementById(`favs${song.id}${listName}`).addEventListener('click', () => {
                    // Aquí va el código para añadir la canción a favoritos
                    if(!song.isFav){
                        myFavorite.addSong(song);
                        song.isFav = true;
                    }else{
                        song.isFav = false
                        myFavorite.removeSong(song)
                    }
                    biblioGeneral.renderList()
                    myPlaylist.renderList()
                    myFavorite.renderList()

                    if(musicPlayer.currentPlayList){
                        musicPlayer.removePlayList()
                    }
                    musicPlayer.addPlayList(...myFavorite.songs)
                    console.log("Deberian quedar:",myFavorite.songs)
                    console.log("En realidad están en music player", musicPlayer.currentPlayList)
                });
            });
        };
        
        // Método Buscar (por canción, artista, álbum, género)
        searchBy(met = this.renderList(), listaCanciones = this.songs){
            // Captura la barra de input donde ingresamos la canción a buscar
            const buscador = document.getElementById("input-buscador")
            listaCanciones = this.songs;
            // Buscamos según el valor de ese input
            buscar();
    
            function buscar (){
                                        //evento   fx
                buscador.addEventListener('input', function() {
                    let input = this.value;
                    /* Regex */
                    let expresion = new RegExp(input, "i");
                    /* Función para comparar input con array */
                    const inputResultado = comparar(listaCanciones, expresion);
        
                    let tituloBusqueda= document.getElementById("biblio-titulo");
                    if(!this.value){
                        tituloBusqueda.textContent = "Biblioteca General";
                    }else{
                        tituloBusqueda.textContent = "Resultados de la búsqueda:";
                    }
                    // Muestra los resultados en la sección izquierda, y retorna los mismos 
                    met(inputResultado, "lista-general", biblioGeneral.listName)
                    return(inputResultado, "lista-general")
                });
            }
            
            // Todos los filtros aplicados al input para hallar coincidencias están aquí
            function comparar(lista, expresion){
                let resultadoCancion = lista.filter(
                    // Song: canción de c/iteración
                    song => expresion.test(song.name) || expresion.test(song.artist) || expresion.test(song.album) || expresion.test(song.gender)// Hay alguna coincidencia entre 'song' y la regex?
                    // Si la r// es True, el return (implícito) será la presente canción
                );
                return(resultadoCancion)
            
            }
        }
    }


    class MusicPlayer{
        constructor({currentPlayList = []}){
            this.currentPlayList = currentPlayList;
            this.currentSongIndex = 0;
        }
        // Se carga playlist al MusicPlayer. De esa forma, podremos navegarla con los botones
        addPlayList(...songs){
            this.currentPlayList.push(...songs)
            
        }
        // Elimina la playlist actual cada vez que sea necesario cargar una nueva
        removePlayList(){
            this.currentPlayList = [];
            this.currentSongIndex = 0;
        }
        // Seteamos cuál es el index de la canción que hemos seleccionado. De esa forma, se empieza a reproducir desde esa canción. Por defecto está seteado en 0
        setCurrentSong(index){
            this.currentSongIndex = index
        }
        // Generamos el UI del MusicPlayer, e iniciamos los controladores, con los datos que ya hemos cargado al mismo
        renderMusicPlayer(){
            const song = this.currentPlayList[this.currentSongIndex]
            // 1. Generamos el UI
            generateMusicPlayer(song)
            // 2. Iniciamos/actualizamos los controladores
            this.reproductor()
        }
        // Esta función se ejecuta cuando hacemos click en una canción, independientemente de su lista, para reproducirla
        playFromList(){
            /* const audio = document.getElementById("audio"); */
            // Está planteado de esta forma para que no hayan conflictos al reproducir y luego pausar, hacer stop, o navegar la lista
            if(this.currentSongIndex !== undefined){
                audio.pause()
                audio.src = this.currentPlayList[this.currentSongIndex].urlSong
                audio.oncanplaythrough = function() {
                    audio.play();
                    audio.oncanplaythrough = null; // Elimina el evento después de reproducir 
                }

            }else{
                audio.pause()
            }
            // Se reinicia el controlador para seguir trabajando
            this.reproductor()
        }
        
        
        reproductor(songs = this.currentPlayList) {
        // Obtener el botón play
        const playButton = document.getElementById("play");
        // Obtener el botón de stop
        const stopButton = document.getElementById("stop");
        // Obtener el botón de prev
        const prevSongButton = document.getElementById("prevSong");
        // Obtener el botón de next
        const nextSongButton = document.getElementById("nextSong");
        // Obtener el botón Mute
        const muteButton = document.getElementById("mute");

        // Crear instancia de Audio
       
                    
        // console.log("Lista a reproducir en verdad", songs)

        // Se asigna el url de la canción actual al objeto Audio
        audio.src = songs[this.currentSongIndex].urlSong;
        let currentSongIndex = this.currentSongIndex;

        

        //Para mostrar el currentTime en tiempo real
        audio.addEventListener('timeupdate', function(){
            let duration = formatDuration(audio.duration)
            let timeShow = document.querySelector("#cancion-duracion") 
            let currentTime = formatDuration(audio.currentTime)
        
            timeShow.innerText = currentTime +'/'+ duration

        })

        audio.addEventListener('ended', changeAudio);

        function changeAudio() {
            /* if(!musicPlayer.currentPlayList){
                musicPlayer.currentPlayList = biblioGeneral.songs;
                musicPlayer.currentSongIndex = 0;
            } */
            songs = musicPlayer.currentPlayList;

            if (!audio.src) {
                audio.src = songs[currentSongIndex].urlSong;
                audio.play();
            } else {
                if (currentSongIndex === songs.length - 1) {
                    currentSongIndex = 0;
                } else {
                    currentSongIndex++
                }
                audio.pause();
                audio.src = songs[currentSongIndex].urlSong;

                audio.oncanplaythrough = function() {
                    audio.play();
                    audio.oncanplaythrough = null; // Elimina el evento después de reproducir 
                }
            }
            generateMusicPlayer(songs[currentSongIndex])

        }


        // Al hacer click en Play... cambia el boton a stop y viceversa
        playButton.addEventListener('click', function() {
            if (audio.paused) {
                audio.play();
                // Cambiar ícono a pausa
                playIcon.classList.remove('fa-circle-play');
                playIcon.classList.add('fa-pause-circle');
            } else {
                audio.pause();
                // Cambiar ícono a play
                playIcon.classList.remove('fa-pause-circle');
                playIcon.classList.add('fa-circle-play');
            }
        });
    

        //Event listener de los otros botones
        // Al hacer click en Stop...
        stopButton.addEventListener('click', function () {
            audio.pause();
            audio.currentTime = 0;
            });
        // Al hacer click en Previous 
        prevSongButton.addEventListener('click', () => {
            songs = this.currentPlayList;
            if (currentSongIndex > 0) {
                currentSongIndex--;
            } else {
                currentSongIndex = songs.length - 1;
            }
            audio.pause();
            audio.src = songs[currentSongIndex].urlSong;

            audio.oncanplaythrough = function() {
                audio.play();
                audio.oncanplaythrough = null; // Elimina el evento después de reproducir 
            }
            // Es necesario generar nuevamente la UI, para que se muestre la nueva canción
            generateMusicPlayer(songs[currentSongIndex])
            }/* .bind(this) */);
        
        // Al hacer click en Next...
        nextSongButton.addEventListener('click',  ()=> {
            songs = this.currentPlayList;
            if (currentSongIndex < songs.length - 1) {
                currentSongIndex++;
            } else {
                currentSongIndex = 0;
                }
            audio.pause();
            audio.src = songs[currentSongIndex].urlSong;
            audio.oncanplaythrough = function() {
                audio.play();
                audio.oncanplaythrough = null; // Elimina el evento después de reproducir 
            }
            // Es necesario generar nuevamente la UI, para que se muestre la nueva canción
            generateMusicPlayer(songs[currentSongIndex])
            }/* .bind(this) */);

            // Al hacer click en Mute...
        muteButton.addEventListener('click', function() {
            if (audio.muted) {
                audio.muted = false;
                
                
            } else {
                audio.muted = true;
                
            }
            }/* .bind(this) */);
        }

            
        }

    function formatDuration(duration) {
        let minutes = Math.floor(duration / 60);
        let seconds = Math.floor(duration % 60);
    
        // Asegurarse de que los minutos y los segundos siempre tengan dos dígitos
        minutes = (minutes < 10) ? '0' + minutes : minutes;
        seconds = (seconds < 10) ? '0' + seconds : seconds;
    
        return minutes + ':' + seconds;
    }

    // Esta fx está dedicada a generar el código html del UI del reproductor, y mostrar en él los datos de la canción que hemos seleccionado (la mitad superior, sobre los botones del music player)
    function generateMusicPlayer(song){
        const musicPlayer_ui = document.querySelector(".musicPlayer-cover")

        audio.addEventListener('loadedmetadata', function() {
            let duration = audio.duration;
            console.log(duration);

            let songDuration = formatDuration(duration)
            song.duration = songDuration
            
            musicPlayer_ui.innerHTML = `
            <div class="album-cover" style="background-image: url(${song.urlCover})"></div>
            <div class="music-info-container">
                <h3 class="cancion-titulo" id="cancion-titulo">${song.name}</h3>
                <div class="cancion-info">
                    <div class="cancion-titulos">
                        <p id="cancion-artista">${song.artist}</p>
                        <p id="cancion-album">${song.album}</p>
                        <p id='anio'> ${song.year}</p>
                        <p id='genero'> ${song.gender}</p>
                    </div>
                    <div class="cancion-duracion">
                        <h3 id="cancion-duracion">${song.duration}</h3>
                    </div>
                </div>
            </div>
            `
        })
    }
    
    // Al hacer click en c/canción, independientemente de su lista, se ejecutará esta función
    function changeCurrentSong(songId, currentPlayList){
        // Si ya se cuenta con un playlist en MusicPlayer, se reemplazará con el playlist al que pertenece la canción seleccionada
        if(musicPlayer.currentPlayList){
            musicPlayer.removePlayList()
        }
        musicPlayer.addPlayList(...currentPlayList)

        
        // Para renderizar la canción seleccionada en el UI del reproductor...
        // 1. Usamos el id de la canción para localizarla en la playlist cargada en el MusicPlayer
        const song = musicPlayer.currentPlayList.find(s => s.id === songId);
        // 2. Obtenemos el index de la canción en dicha playlist
        musicPlayer.setCurrentSong(musicPlayer.currentPlayList.indexOf(song))
        // 3. Seteamos los datos de la canción en el url del objeto Audio
        audio.src = song.urlSong
        // 4. Reiniciamos el UI del reproductor, para que cargue, muestre y controle la canción que hemos seleccionado
        musicPlayer.renderMusicPlayer()
        musicPlayer.playFromList()
        
    }

    /* Crear lista de nuevas canciones */
    const songs = [
        
        new Song({
            
            name: "I Ain't Worried",
            artist: "One republic",
            duration: "02:34",
            album: "Top Gun Maverick",
            gender: "Pop",
            year: "2022",
            urlSong: "./src/songs/OneRepublic - I Ain’t Worried.mp3",
            urlCover: "./src/img/One_Republic.jpg"
    
        }),
            new Song({
            
            name: "",
            artist: "",
            duration: "",
            album: "",
            gender: "",
            year: "",
            urlSong: "",
            urlCover: ""
        
        }),
    
        new Song({
            
            name: "Sweet Child o Mine",
            artist: "Guns N Roses",
            duration: "05:56",
            album: "Appetite for Destruction",
            gender: "Hard rock ",
            year: "1987",
            urlSong: "./src/songs/Guns_N_Roses_Sweet_Child_O_Mine.mp3",
            urlCover: "./src/img/sweet_child_mine_guns_n_roses.jpeg"
    
        }),
    
        new Song({
            name: "Livin on a Prayer",
            artist: "Bon Jovi",
            duration: "04:11",
            album: "Slippery When Wet",
            gender: "Glam meta",
            year: "1986",
            urlSong: "./src/songs/Bon_Jovi_Livin_On_A_Prayer.mp3",
            urlCover: "./src/img/livin_on_a_prayer_bon_jovi.jpg"
    
        }),
    
        new Song({
            name: "Every Breath You Take",
            artist: "The Police",
            duration: "04:13",
            album: "Synchronicity",
            gender: "Pop rock",
            year: "1983",
            urlSong: "./src/songs/The_Police_Every_Breath_You_Take.mp3",
            urlCover: "./src/img/every_breath_you_take_the_police.jpeg"
    
        }),
    
        new Song({
            name: "With or Without You",
            artist: "U2",
            duration: "04:55",
            album: "The Joshua Tree",
            gender: "rock",
            year: "1987",
            urlSong: "./src/songs/U2_With_Or_Without_You.mp3",
            urlCover: "./src/img/With_or_Without_You_U2.jpeg"
    
        }),
    
        new Song({
            name: "Dont Stop Believin",
            artist: "Journey ",
            duration: "04:11",
            album: "Escape",
            gender: "rock",
            year: "1981",
            urlSong: "./src/songs/Journey_Dont_Stop_Believin.mp3",
            urlCover: "./src/img/dont_stop_believin_journey.jpeg"
    
        }),
    
        new Song({
            name: "Billie Jean",
            artist: "Michael Jackson",
            duration: "04:54",
            album: "Thriller",
            gender: "R&B",
            year: "1982",
            urlSong: "./src/songs/Michael_Jackson_Billie_Jean.mp3",
            urlCover: "./src/img/billie_jean_michael_jackson.jpeg"
    
        }),
    
    
        new Song({
            name: "Another One Bites the Dust",
            artist: "Queen",
            duration: "03:34",
            album: "The Game",
            gender: "rock",
            year: "1980",
            urlSong: "./src/songs/Queen_Another_One_Bites_The_Dust.mp3",
            urlCover: "./src/img/another_one_bites_the_dust_queen.jpeg"
    
        }),
    
        new Song({
            name: "Eye of the Tiger",
            artist: "Survivor ",
            duration: "04:03",
            album: "Rocky III",
            gender: "rock",
            year: "1982",
            urlSong: "./src/songs/Survivor_Eye_of_the_Tiger.mp3",
            urlCover: "./src/img/eye_of_the_tiger_survivor.jpeg"
    
        }),
        new Song({
            
            name: "Stay",
            artist: "Robbie Seay Band",
            duration: "05:00",
            album: "Give yourself away",
            gender: "Christian rock",
            year: "2018",
            urlSong: "./src/songs/stay.mp3",
            urlCover: "./src/img/robbie_give_yourself_away.jpg"
    
        }),
        new Song({
            name: "Africa",
            artist: "Toto",
            duration: "04:55",
            album: "Toto IV",
            gender: "rock",
            year: "1984",
            urlSong: "./src/songs/Toto_Africa.mp3", // Asegúrate de que la URL de la canción tenga la extensión .mp3
            urlCover: "./src/img/africa_toto.jpeg"
        }),
    
        new Song({
            name: "Take On Me",
            artist: "a-ha",
            duration: "03:45",
            album: "Hunting High and Low",
            gender: "Synth pop",
            year: 1984,
            urlSong: "./src/songs/a_ha_Take_On_Me.mp3",
            urlCover: "./src/img/take_on_me_a-ha.jpeg"
        }),
    
        new Song({
            name: "Summer of 69",
            artist: "Bryan Adams",
            duration: "03:32",
            album: "Reckless",
            gender: "pop rock",
            year: "1984",
            urlSong: "./src/songs/Bryan_Adams_Summer_Of_69.mp3",
            urlCover: "./src/img/summer_of_69_bryan_adams.jpeg"
        }), // Asegúrate de cerrar la última instancia de new Song con })
    
    
        new Song({
            name: "Jump",
            artist: "Van Halen",
            duration: "03:59",
            album: "1984",
            gender: "rock",
            year: "1984",
            urlSong: "./src/songs/Van_Halen_Jump.mp3",
            urlCover: "./src/img/Jump_van_halen.jpeg"
    
        }),
        new Song({
            name: "The Final Countdown",
            artist: "Europe",
            year: "1986",
            album: "The Final Countdown",
            duration: "5:10",
            gender: "Rock",
            urlSong: "./src/songs/Europe - The Final Countdown (Official Video).mp3",
            urlCover: "./src/img/Europe-the_final_countdown.jpg"
        }),
    
        new Song({
            name: "I Love Rock n Roll",
            artist: "Joan Jett & the Blackhearts",
            year: "1981",
            album: "I Love Rock Roll",
            duration: "2:55",
            gender: "Rock",
            urlSong: "./src/songs/Joan Jett & the Blackhearts - I Love Rock N Roll (Official Video).mp3",
            urlCover: "src/img/i_love_rock_n_roll.jpg"
        }),
    
        new Song({
            name: "Hungry Like the Wolf",
            artist: "Duran Duran",
            year: "1982",
            album: "Rio",
            duration: "3:41",
            gender: "New Wave",
            urlSong: "./src/songs/Hungry Like the Wolf (Night Version) (2009 Remaster).mp3",
            urlCover: "./src/img/Duran-Duran-Hungry-Like-The-W-14123.jpg"
        }),
    
        new Song({
            name: "Dont You (Forget About Me)",
            artist: "Simple Minds",
            year: "1985",
            album: "The Breakfast Club (Soundtrack)",
            duration: "4:20",
            gender: "New Wave",
            urlSong: "./src/songs/Simple Minds - Dont You (Forget About Me)_CdqoNKCCt7A.mp3",
            urlCover: "./src/img/Dont_you_forget_about_me.jpg"
        }),
    
        new Song({
            name: "Under Pressure",
            artist: "Queen & David Bowie",
            year: "1981",
            album: "",
            duration: "4:04",
            gender: "Rock",
            urlSong: "./src/songs/Queen - Under Pressure (Official Video)_a01QQZyl-_I.mp3",
            urlCover: "./src/img/800px-Queen_&_David_Bowie_-_Under_Pressure.jpeg"
        }),
    
        new Song({
            name: "We Will Rock You",
            artist: "Queen",
            year: "1981",
            album: "News of the World",
            duration: "2:01",
            gender: "Rock",
            urlSong: "./src/songs/Queen - We Will Rock You (Official Video)_-tJYN-eG1zk.mp3",
            urlCover: "./src/img/We_Will_Rock_You.png"
        }),
    
        new Song({
            name: "Like a Virgin",
            artist: "Madonna",
            year: "1984",
            album: "Like a Virgin",
            duration: "3:11",
            gender: "Pop",
            urlSong: "./src/songs/Madonna - Like A Virgin (Official Video)_s__rX_WL100.mp3",
            urlCover: "./src/img/LikeAVirgin1984.png"
        }),
    
        new Song({
            name: "Walk Like an Egyptian",
            artist: "The Bangles",
            year: "1986",
            album: "Different Light",
            duration: "3:23",
            gender: "Pop",
            urlSong: "./src/songs/The Bangles - Walk Like an Egyptian (Official Video).mp3",
            urlCover: "./src/img/The_Bangles_Walk_Like_An_Egyptian.jpg"
        }),
    
        new Song({
            name: "Start Me Up",
            artist: "The Rolling Stones",
            year: "1981",
            album: "Tattoo You",
            duration: "3:32",
            gender: "Rock",
            urlSong: "./src/songs/Rolling Stones-start me up_ZzlgJ-SfKYE.mp3",
            urlCover: "./src/img/RollStones-Single1981_StartMeUp.jpg"
        }),
    
        new Song({
            name: "Beat It",
            artist: "Michael Jackson",
            year: "1983",
            album: "Thriller",
            duration: "4:18",
            gender: "Pop",
            urlSong: "./src/songs/Michael Jackson - Beat It (Official 4K Video).mp3",
            urlCover: "./src/img/Beat_It.jpg"
        }),
    
        new Song({
            name: "I Want to Know What Love Is",
            artist: "Foreigner",
            year: "1984",
            album: "Agent Provocateur",
            duration: "5:00",
            gender: "Rock",
            urlSong: "./src/songs/Foreigner - I Want To Know What Love Is (Official Music Video)_r3Pr1_v7hsw.mp3",
            urlCover: "./src/img/Foreigner-I-Want-To-Know-Wh-297484.jpg"
        }),
    
        new Song({
            name: "Welcome to the Jungle",
            artist: "Guns N Roses",
            year: "1987",
            album: "Appetite for Destruction",
            duration: "4:34",
            gender: "Rock",
            urlSong: "./src/songs/Guns N Roses - Welcome To The Jungle.mp3",
            urlCover: "./src/img/Welcometothejungle.jpg"
        }),
    
        new Song({
            name: "Every Rose Has Its Thorn",
            artist: "Poison",
            year: "1988",
            album: "Open Up and Say... Ahh!",
            duration: "4:20",
            gender: "Rock",
            urlSong: "./src/songs/Poison - Every Rose Has Its Thorn (Official Music Video).mp3",
            urlCover: "./src/img/Every_Rose_Has_Its_Thorn-Cover.jpg"
        }),
    
        new Song({
            name: "Everybody Wants to Rule the World",
            artist: "Tears for Fears",
            year: "1985",
            album: "Songs from the Big Chair",
            duration: "4:11",
            gender: "New Wave",
            urlSong: "./src/songs/Everybody Wants To Rule The World_awoFZaSuko4.mp3",
            urlCover: "./src/img/Everybody_Wants_to_Rule_the_World.png" 
        }),
    
    
        new Song({
            name: "Thriller",
            artist: "Michael Jackson",
            year: "1982",
            album: "Thriller",
            duration: "5:57",
            gender: "Pop",
            urlSong: "./src/songs/Michael Jackson - Thriller (Lyrics)_rLMr9CsJHME.mp3",
            urlCover: "./src/img/Michael_Jackson_-_Thriller.png"
        }),
    
    
    ]

// Originalmente me faltó añadir el atribuito ID, y es necesario :( 
// Con eso se lo añado a todas las canciones
function addID(songs){
    id = 0;
    songs.forEach((song)=>{
        song.id = id;
        id += 1
    })
}

addID(songs) // Listo :D


// Crear PlayLists
const biblioGeneral = new Playlist({
    listName: "Biblioteca General",
    container: "lista-general" // lista de canciones generales
})
const myPlaylist = new Playlist({
    listName: "My PlayList",
    container: "lista-general-2" // lista de canciones con like.
})
const myFavorite = new Playlist({
    listName:'My Favorite',
    container: 'lista-general-3'//Lista de canciones favoritas.
})
    /* Agregar canciones al playlist general */
    biblioGeneral.addSong(...songs)
   // console.log(biblioGeneral.songs)
    /* Mostrar playlist en su container */
    biblioGeneral.renderList()
    /* Crear instancia Music Player */
    const musicPlayer = new MusicPlayer({
        currentPlayList: biblioGeneral.songs
    })

    
    /* Ejecutar la búsqueda (lado izq) */
    biblioGeneral.searchBy(biblioGeneral.renderList)
    
    // Cargar, mostrar y controlar la 1era canción de la playlist por defecto
    musicPlayer.renderMusicPlayer()

