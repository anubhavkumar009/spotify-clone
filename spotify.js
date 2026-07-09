let currentSong = new Audio;
let songs;
let folders = [];
let currfolder;
let currentFolderIndex = 0;
let currvolume;
let firstFolder = null;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currfolder = folder;

    let a = await fetch(`/assets/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");

    songs = [];

    for (let index = 0; index < as.length; index++) {
        let element = as[index];
        let href = element.getAttribute("href");

        if (href && href.endsWith(".mp3")) {
            href = decodeURIComponent(href);
            href = href.replace(/\\/g, "/");

            let file = href.split("/").pop();
            songs.push(file);
        }
    }


    //Show all songs in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="assets/music.svg" alt="">
                                                    <div class="info">
                                                        <div>${decodeURI(song)}</div>
                                                        <div>Anubhav</div>
                                                    </div>
                                                    <div>
                                                        <span>play now</span>
                                                        <span><img class="invert" src="assets/play.svg" alt=""></span>
                                                    </div>
                                                </li>`;
    }

    // Attach Eventlistner to each Song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/assets/${currfolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "assets/pause.svg";
    }
    console.log(decodeURI(track));
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

    updateButtons();
}


// Update the appearance of next and previous buttons
function updateButtons() {
    if (songs.length == 0) {
        previous.style.opacity = "0";
        play.style.opacity = "0";
        next.style.opacity = "0";
        return;
    }

    play.style.opacity = "1";

    let index = songs.indexOf(decodeURI(currentSong.src.split("/").slice(-1)[0]));

    previous.style.opacity = (index == 0) ? "0.2" : "1";
    next.style.opacity = (index == songs.length - 1) ? "0.2" : "1";
}

// Update the appearance of right and left arrow
function updateFolderButtons()
{
    leftarrow.style.opacity=(currentFolderIndex==0)?"0.2":"1";
    rightarrow.style.opacity=(currentFolderIndex==folders.length-1)?"0.2":"1";
}


// Display all the Albums on the page
async function displayAlbum() {
    let a = await fetch(`/assets/songs/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let cardcontainer = document.querySelector(".cardContainer")
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
    for (let i = 0; i < array.length; i++) {
        const e = array[i];
        e.href = decodeURI(e.href);
        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];
            folders.push(folder);

            if (firstFolder == null)
                firstFolder = folder;

            let a = await fetch(`/assets/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div  data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="assets/play.svg" alt="">
                        </div>
                        <img src="/assets/songs/${folder}/Cover.jpg"  alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            currentFolderIndex = folders.indexOf(item.currentTarget.dataset.folder);
            songs = await getSongs(`songs/${folders[currentFolderIndex]}`);
            playMusic(songs[0]);
            updateFolderButtons();
        })
    })
}

async function main()
{
    //Get the list of all songs
    await displayAlbum();
    currentFolderIndex = folders.indexOf(firstFolder);
    await getSongs(`songs/${firstFolder}`);
    playMusic(songs[0], true);

    updateFolderButtons();

    // Attach a EventListner to Play
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "assets/pause.svg";
        }

        else {
            currentSong.pause();
            play.src = "assets/play.svg";
        }
    })

    // Listen for Time Update Event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an Event Listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Add an Event Listner for Hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-150%";
    })

    // Add Event Listner to Previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(decodeURI(currentSong.src.split("/").slice(-1)[0]));
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }

    })

    // Add Event Listner to Next
    next.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(decodeURI(currentSong.src.split("/").slice(-1)[0]));
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    })

    // Add Event Listner to Right Arrow
    rightarrow.addEventListener("click", async () => {
        if (currentFolderIndex + 1 < folders.length) {
            currentFolderIndex++;
            songs = await getSongs(`songs/${folders[currentFolderIndex]}`);
            playMusic(songs[0]);
            updateFolderButtons();
        }
    });

    // Add Event Listner to Left Arrow
    leftarrow.addEventListener("click", async () => {
        if (currentFolderIndex - 1 >= 0) {
            currentFolderIndex--;
            songs = await getSongs(`songs/${folders[currentFolderIndex]}`);
            playMusic(songs[0]);
            updateFolderButtons();
        }
    });

    // Add an Event Listner to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("assets/mute.svg", "volume.svg")
        }
    })

    // Add Event Listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("assets/volume.svg")) {
            currvolume = currentSong.volume;
            e.target.src = e.target.src.replace("assets/volume.svg", "assets/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }

        else {
            e.target.src = e.target.src.replace("assets/mute.svg", "assets/volume.svg")
            currentSong.volume = currvolume;
            document.querySelector(".range").getElementsByTagName("input")[0].value = currvolume * 100;
        }

    })

}

main();
