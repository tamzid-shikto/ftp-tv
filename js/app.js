/*let DATA = {
    "tv_show" : {
        "abc1" : {
            seasons : {
                "s1" : ["S1EP1.mp4","S1EP2.mp4","S1EP3.mp4"],
                "s2" : ["S2EP1.mp4","S2EP2.mp4"]
            },
            banner : "vvv.png"
        },
        "abc222" : {
            seasons : {
                "s1" : ["S1EP1.mp4","S1EP2.mp4","S1EP3.mp4"],
            }
        },
    },
    "movie" : {
        "mv1" : {
            video : "mv1_vid.mp4",
            banner : "mv1_banner.png"
        },
        "mv22" : {
            video : "mv2_vid.mp4",
            banner : "mv2_banner.png"
        }
    }
};*/

let ITEM_TEMPLATE_HTML = document.getElementById("item_template").innerHTML;

let WATCH_LIST = document.getElementById("screen_home_watch_history_list")
let HISTORY_LIMIT = 3;

function search(input){
    alert(input.value)
}

let SEARCH_DATA = {
    input: document.getElementsByClassName("s_input")[0],
    root: undefined
}

let LIST_PARENT = document.getElementById("list_parent");
const SCREENS = {
    SPLASH : document.getElementById("splash"),
    HOME : document.getElementById("screen_home"),
    SEARCH : document.getElementById("search_base"),
    EPISODES : document.getElementById("episode_list_base"),
}
let ITEM_COUNT = 0
let LAST_FOCUS;

let LIST_DATA = {
    tag_txt : "",
    tag_color : "",
    parentEle : undefined,
    data : {}
}
let TV_MODE = true;
let WATCH_HISTORY = (window.localStorage.getItem("history") || "").split("$$$SHIKTO$$$")
if(WATCH_HISTORY[0] == "") WATCH_HISTORY = []

function PlayVideo(data, show_path){
    if(TV_MODE){
        console.log(data)
    }else{
        window.location.href = data.replace("load_video_###","")
    }
    if(WATCH_HISTORY.indexOf(show_path) != -1) {
        WATCH_HISTORY.splice(WATCH_HISTORY.indexOf(show_path), 1)
    }
    WATCH_HISTORY.push(show_path)
    window.localStorage.setItem("history", WATCH_HISTORY.join("$$$SHIKTO$$$"))
}

function ShowScreen(showEle, showEle2){
    [...Object.values(SCREENS)].forEach(v=>{
        v.style.display = "none"
    })
    showEle.style.display = "block"
    if(showEle2) showEle2.style.display = "block"
}

let SHOULD_SEARCH = false;
let LAST_SEARCH_TXT = "";
setInterval(() => {
    if(!SHOULD_SEARCH) return;
    let search_txt = (SEARCH_DATA.input.value + "")
    if(search_txt != LAST_SEARCH_TXT){      
        ITEM_COUNT = 0;  
        console.log(search_txt, LAST_SEARCH_TXT)
        LAST_SEARCH_TXT = search_txt;
        if(search_txt.length == 0){
            POPULATE_LIST(LIST_DATA.data);
            return;
        }
        search_txt = search_txt.trim().toLowerCase();
        let NEW_DATA = {}
        Object.entries(LIST_DATA.data).forEach(([k, v]) =>{
            if(search_txt.length == 0 || k.trim().toLowerCase().split(search_txt).length > 1) NEW_DATA[k] = v;
        })
        //console.log(0, NEW_DATA)
        POPULATE_LIST(NEW_DATA);
    }
}, 50);

setTimeout(() => {
    ShowScreen(SCREENS.HOME)
}, 1);

let SEARCH_BASES = {
    "tv_show": "",
    "anime": "",
    "movie": "",
    "documentary": "",
}

let ELEMENT_CACHE = {}

function BuildItemCard(title, banner, callback, pos, context){
    let id = "ID_" + title + banner + context; // + Date.now() + (Math.random()*9999999);
    if(ELEMENT_CACHE[id]){
        document.getElementById(id).style.display = "flex"
        return;
    }
    let new_item = ITEM_TEMPLATE_HTML + "";
    new_item = new_item
        .replace("$$$id", id)
        .replace("$$$title_text", title)
        .replace("$$$banner_url", banner)
        .replace("$$$tag_text", LIST_DATA.tag_txt)
        .replace("$$$tag_color", LIST_DATA.tag_color)
        .replace("$$$focus_pos", pos)
    //LIST_DATA.parentEle.innerHTML += new_item;
    var div = document.createElement('div');
    div.innerHTML = new_item
    document.body.appendChild(div)
    setTimeout(() => {
        let ele = div.children[0]
        LIST_DATA.parentEle.appendChild(ele)
        //console.log(ele);
        ele.onclick = callback
        ELEMENT_CACHE[id] = ele;
        setTimeout(() => {
            document.body.removeChild(div)
        }, 1);
    }, 1);
}

function POPULATE_LIST(DATA, countAdd=30, dontremove){
    let tagCache = LIST_DATA.tag_txt + ""
    let tagColorCache = LIST_DATA.tag_color + ""
    console.log("POPULATE_LIST", countAdd);
    if(!dontremove) [...LIST_PARENT.children].forEach(v=>v.style.display = "none")
    let count = 0;
    let local_count = 0;
    Object.entries(DATA).forEach(([k, v]) =>{
        local_count++;
        if(local_count<=ITEM_COUNT) return;
        count++;
        if(count > countAdd) return;
        BuildItemCard(k, v.banner, ()=>{
            if(v.video){
                let savedata = [LIST_DATA.tag_txt, LIST_DATA.tag_color, k, JSON.stringify(v)].join("$$$S_SPLIT$$$$")
                PlayVideo("load_video_###" + v.video, savedata)
            }
            else{
                LIST_DATA.tag_txt = tagCache;
                LIST_DATA.tag_color = tagColorCache
                ShowEpisodeBase(v,k);
            }
        }, ITEM_COUNT+count, 1);
    })

    ITEM_COUNT += countAdd
}

let LAST_ITEM_FOCUS;

function ShowEpisodeBase(show_data, title){
    LAST_ITEM_FOCUS = LAST_FOCUS;
    const {seasons, banner} = show_data;
    let season_block_base = document.getElementById("season_block_base")
    season_block_base.innerHTML = ""
    let episode_list_show_title = document.getElementById("episode_list_show_title")
    episode_list_show_title.innerHTML = title
    Object.entries(seasons).forEach(([k, v])=>{
        let season_block = document.createElement("div")
        season_block.className = "season_block";
        season_block_base.appendChild(season_block)

        let season_title = document.createElement("span")
        season_title.className = "season_title"
        season_title.innerHTML = k
        season_block.appendChild(season_title)

        let episode_list = document.createElement("div")
        episode_list.className = "episode_list"
        season_block.appendChild(episode_list)

        let count = 0;
        v.forEach(ep=>{
            count++;
            let episode_chip = document.createElement("button")
            episode_chip.className = "episode_chip"
            let episode_path_id = title+"/"+k+"/"+count
            let hasWatched = window.localStorage.getItem(episode_path_id)
            if(hasWatched) episode_chip.className = "watched-bg " + episode_chip.className;
            episode_chip.innerHTML = `EP${count}`
            episode_list.appendChild(episode_chip)
            episode_chip.onclick = ()=>{                
                let savedata = [LIST_DATA.tag_txt, LIST_DATA.tag_color, title, JSON.stringify(show_data)].join("$$$S_SPLIT$$$$")
                PlayVideo("load_video_###" + ep, savedata)
                window.localStorage.setItem(episode_path_id, Date.now()+"")
                episode_chip.className = "watched-bg " + episode_chip.className;
            }
        })
    })
    SCREENS.EPISODES.style.display = "flex"
    SCREENS.EPISODES.getElementsByTagName("button")[0].focus();
}

let LAST_HOME_FOCUS;

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        BACK_PRESS();
    }
});

function ShowSearchBase(type){
    HISTORY_LIMIT = 0;
    document.getElementById("screen_home_show_all").style.display = "block"
    LAST_HOME_FOCUS = LAST_FOCUS;
    LIST_DATA.parentEle = LIST_PARENT
    if(type == "anim_movie_low"){
        LIST_DATA.tag_txt = "Anime Movie"
        LIST_DATA.tag_color = "green"
        LIST_DATA.data = DATA["anim_movie_low"];
    }
    if(type == "anim_movie"){
        LIST_DATA.tag_txt = "Anime Movie"
        LIST_DATA.tag_color = "green"
        LIST_DATA.data = DATA["anim_movie"];
    }
    if(type == "tv_series"){
        LIST_DATA.tag_txt = "TV Series"
        LIST_DATA.tag_color = "blue"
        LIST_DATA.data = DATA["tv_series"];
    }
    if(type == "movie"){
        LIST_DATA.tag_txt = "Movie"
        LIST_DATA.tag_color = "red"
        LIST_DATA.data = DATA["english_movie_high"];
    }
    if(type == "movie_low"){
        LIST_DATA.tag_txt = "Movie"
        LIST_DATA.tag_color = "red"
        LIST_DATA.data = DATA["english_movie"];
    }
    if(type == "anim_series"){
        LIST_DATA.tag_txt = "Anime Series"
        LIST_DATA.tag_color = "cyan"
        LIST_DATA.data = DATA["anim_series"];
    }

    POPULATE_LIST(LIST_DATA.data);
        ShowScreen(SCREENS.SEARCH)
        SHOULD_SEARCH = true;
        setTimeout(() => {            
            LIST_PARENT.children[0].focus()
        }, 100);
}

window.onload = ShowHome;

function ShowHome(){
    if(LAST_HOME_FOCUS) LAST_HOME_FOCUS.focus()
    
    WATCH_LIST.innerHTML = ""
    ELEMENT_CACHE = {}  
    LIST_PARENT.innerHTML = ""
    ShowScreen(SCREENS.HOME)
    SHOULD_SEARCH = false;
    ITEM_COUNT = 0;
    SEARCH_DATA.input.value = ""
    
    LIST_DATA.parentEle = WATCH_LIST
    let tmp = [...WATCH_HISTORY]
    tmp.reverse()    
    let ccount = 0;
    console.log("tmp count", tmp)
    tmp.forEach(h=>{
        ccount++;
        if(HISTORY_LIMIT!=0 && ccount>HISTORY_LIMIT) return;
        const [tag, color, name, data] = h.split("$$$S_SPLIT$$$$");
        const Jdata = JSON.parse(data)
        LIST_DATA.tag_txt = tag;
        LIST_DATA.tag_color = color;
        BuildItemCard(name, Jdata.banner, ()=>{
            if(Jdata.video){
                PlayVideo("load_video_###" + Jdata.video, h)
            }
            else{
                LIST_DATA.tag_txt = tag;
                LIST_DATA.tag_color = color
                ShowEpisodeBase(Jdata, name);
            }
        }, -10000, 0);
    })

    let btns = document.getElementById("screen_home_watch_history").getElementsByTagName("button")
    if(btns.length>0) btns[0].focus();
}
function ShowHistory(){
    
}

function ShowAllHistory(){
    HISTORY_LIMIT=0;
    ShowHome();
    document.getElementById("screen_home_show_all").style.display = "none"
    setTimeout(() => {
        let btns = document.getElementById("screen_home_watch_history").getElementsByTagName("button")
        if(btns.length>0) btns[btns.length-1].focus();
    }, 1);
}

function ON_FOCUS(ele, pos){
    LAST_FOCUS = ele;
    console.log("pos", pos)
    let shouldSmooth = true;
    if(pos || pos == 0){
        if(pos > ITEM_COUNT-10){
            shouldSmooth = false;
            POPULATE_LIST(LIST_DATA.data, 20, true)
            let interval = setInterval(() => {
                LIST_PARENT.children[parseInt(pos)-1].focus()
                LIST_PARENT.children[parseInt(pos)-1].scrollIntoView({
                    block: 'center'
                });
            }, 1);
            setTimeout(() => {
                clearInterval(interval)
            }, 100);
        }
    }
    if(shouldSmooth){
        ele.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

function BACK_PRESS(){
    if(SCREENS.EPISODES.style.display != "none"){
        SCREENS.EPISODES.style.display = "none"
        if(LAST_ITEM_FOCUS) LAST_ITEM_FOCUS.focus();
    }
    else if(SCREENS.SEARCH.style.display != "none"){
        HISTORY_LIMIT = 3;
        ShowHome();
    }
    else if(SCREENS.HOME.style.display != "none"){
        SCREENS.HOME.getElementsByTagName("button")[0].focus();
    }
}

let IMAGE_CACHE = {}

function GetImage(url, callback){
    if(IMAGE_CACHE[url]) callback(IMAGE_CACHE[url])
    else{
        fetchImageAsBase64(url).then(b64img=>{
            IMAGE_CACHE[url] = b64img;
            callback(b64img)
        });
    }
}

async function fetchImageAsBase64(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const blob = await response.blob();
        const base64 = await convertBlobToBase64(blob);
        return base64;
    } catch (error) {
        console.error('Error fetching or converting image:', error);
    }
}

function convertBlobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

window.onfocus = ()=>{
    if(LAST_FOCUS) LAST_FOCUS.focus();
}