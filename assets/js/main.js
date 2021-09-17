/*
1. Render Songs -> Done
2. Scroll top -> Done
3. Play / Pause / Seek -> Done
4. CD rotate -> Done
5. Next / Prev -> Done
6. Random -> Done
7. Next / Repeat when ended -> Done
8. Active song -> Done
9. Scroll active song into view -> Done
10. Play song when click
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "DII_PLAYER";

const player = $('.player');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

const app = {
    currentIndex: 0,
    listPlayedRandomSong: [],
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    isChangingTime: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Teddy Bear Rise',
            singer: 'OHAYO',
            path: './assets/music/teddybearrise.mp3',
            image: './assets/img/teddybearrise.jpg'
        },
        {
            name: 'Phép màu',
            singer: 'Bray',
            path: './assets/music/phepmau.mp3',
            image: './assets/img/phepmau.jpg'
        },
        {
            name: 'Apologize',
            singer: 'One RePublic',
            path: './assets/music/apologize.mp3',
            image: './assets/img/apologize.jpg'
        },
        {
            name: 'Map',
            singer: 'Maroon 5',
            path: 'https://aredir.nixcdn.com/Unv_Audio20/Maps-Maroon5-3298999.mp3?st=9OUNPxbkhBfdfO4nCuNEQw&e=1631938150',
            image: 'https://avatar-ex-swe.nixcdn.com/song/2018/06/22/0/c/c/b/1529655937714_500.jpg'
        },
        {
            name: 'Home',
            singer: 'Thimlife ft. Bibiane Z',
            path: './assets/music/home.mp3',
            image: './assets/img/home.jpg'
        },
        {
            name: 'Có hẹn với thanh xuân',
            singer: 'MONSTAR',
            path: 'https://aredir.nixcdn.com/NhacCuaTui1020/cohenvoithanhxuan-MONSTAR-7050201.mp3?st=kQq7f6bJiH-Yofgq46BsyQ&e=1631937537',
            image: 'https://avatar-nct.nixcdn.com/song/2021/07/16/f/4/9/8/1626425507034.jpg'
        },
    ],

    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function() {
        const htmls = this.songs.map((song, index) =>
        `<div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
            <div class="thumb" style="background-image: url('${song.image}');"></div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>` )
        playlist.innerHTML = htmls.join('\n');
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvents: function() {
        const cdWidth = cd.offsetWidth;
        const _this = this;

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, // 10 s
            iterations: Infinity
        });
        cdThumbAnimate.pause();

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xử lý khi click play
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        // Khi song được play
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // Khi song bị pause
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if (audio.duration && !_this.isChangingTime) {
                const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100);
                progress.value = progressPercent; 
            }
        }

        // Xử lý khi tua song
        progress.onmousedown = function() {
            _this.isChangingTime = true;
        }
        progress.ontouchstart = function() {
            _this.isChangingTime = true;
        }
        progress.onchange = function(e) {
            const seekTime = e.target.value * audio.duration / 100;
            audio.currentTime = seekTime;
            
            _this.isChangingTime = false;
        }
        
        // Khi next song
        nextBtn.onclick = function() {
            _this.isRandom ? _this.playRandomSong() : _this.nextSong();
            _this.setConfig('currentIndex', _this.currentIndex);
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Khi prev song
        prevBtn.onclick = function() {
            _this.isRandom ? _this.playRandomSong() : _this.prevSong();
            _this.setConfig('currentIndex', _this.currentIndex);
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Xử lý bật / tắt random song
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            if (_this.isRandom) {
                _this.listPlayedRandomSong.push(_this.currentIndex);
            } else {
                _this.listPlayedRandomSong = [];
                _this.setConfig('listPlayedRandomSong', _this.listPlayedRandomSong);
            }
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // Xử lý bật / tắt lập lại song
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // Xử lý next song khi audio ended
        audio.onended = function() {
            _this.isRepeat ? audio.play() : nextBtn.click();
        }

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');

            if (songNode || e.target.closest('.option')) {
                if (songNode) {
                    // songNode.getAttribute('data-index');
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    _this.scrollToActiveSong();
                    _this.setConfig('currentIndex', _this.currentIndex);
                    if(_this.isRandom && !_this.checkInPlayedSongs(_this.currentIndex)) {
                        _this.listPlayedRandomSong.push(_this.currentIndex);
                        _this.setConfig('listPlayedRandomSong', _this.listPlayedRandomSong);
                    }
                    audio.play();
                }
            }
        }
    },

    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 500)
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')` ;
        audio.src = this.currentSong.path;
    },

    loadConfig: function() {
        if (typeof(this.config.isRandom) != 'undefined') {
            this.isRandom = this.config.isRandom;
        }
        if (typeof(this.config.isRepeat) != 'undefined') {
            this.isRepeat = this.config.isRepeat;
        }
        if (typeof(this.config.currentIndex) != 'undefined') {
            this.currentIndex = this.config.currentIndex;
        }
        if (typeof(this.config.listPlayedRandomSong) != 'undefined') {
            this.listPlayedRandomSong = this.config.listPlayedRandomSong;
        }
    },

    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }

        this.loadCurrentSong();
    },

    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }

        this.loadCurrentSong();
    },

    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length); //Math.random() * (max - min + 1) + min
        } while (newIndex === this.currentIndex || this.checkInPlayedSongs(newIndex));

        this.currentIndex = newIndex;
        this.listPlayedRandomSong.push(newIndex);
        this.setConfig('listPlayedRandomSong', this.listPlayedRandomSong);
        this.loadCurrentSong();
    },

    checkInPlayedSongs: function(index) {
        if (this.listPlayedRandomSong.length === this.songs.length) {
            this.listPlayedRandomSong = [];
        }

        return this.listPlayedRandomSong.includes(index);
    },
        
    start: function() {
        // Load config từ local storge của user
        this.loadConfig();

        // Định nghĩa các thuộc tính cho Object
        this.defineProperties();

        // Lắng nghe / xử lý các sự kiện (DOM Events)
        this.handleEvents();

        // Tải thông tin bài hát đầu tiên vào UI khi tải ứng dụng
        this.loadCurrentSong();

        // Render Playlist
        this.render();
        // Hiển thị trạng thái ban đầu của button repeat & random
        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);
    }
};

app.start();
