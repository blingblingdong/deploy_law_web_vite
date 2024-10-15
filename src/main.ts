// otherFile.js
const config = {
    apiUrl: "https://deploylawweb-production.up.railway.app"
};

import {File} from './types/File.ts';
import $ from 'jquery';
import {Account} from "./types/account.ts";


/*帳號與初始設定區*/

// 設定三個全域變數
let enter_or_not : boolean;
let account: Account;

$(document).ready(async function() {
    await load_all_chapters();

    // 從 localStorage 中讀取email, user_name
    let email = localStorage.getItem('email');
    let user_name = localStorage.getItem('user_name');


    if (user_name && email) {
        // 建立一個用戶
        account= new Account(user_name, email);
        let result = await account.find_token(config.apiUrl);

        if (result) {
            enter_or_not = true;
            $("#enter-form").css("display", "none");
            $("#personal-data").css("display", "flex");
            $("#user_name").html(user_name);
            $("#user_email").html(email);
        } else {
            alert("使用時間過期，重新登入");
        }

    }
});



const enter_form = document.getElementById('enter-form');

if (enter_form) {
    enter_form.addEventListener('submit', async function(event) {
        event.preventDefault(); // 阻止默認表單提交行為

        // 獲取用戶輸入的數據
        const userName_element = document.getElementById('enter-name');
        const userName = userName_element ? (userName_element as HTMLInputElement).value : '';
        const email_element =  document.getElementById('enter-email');
        const e_mail = email_element ? (email_element as HTMLInputElement).value : '';
        const password_elemnt = document.getElementById('enter-password');
        const password = password_elemnt ? (password_elemnt as HTMLInputElement).value : '';

        account= new Account(userName, e_mail);
        let enter_or_not = await account.login(password, config.apiUrl);
        if(enter_or_not) {
            localStorage.clear();
            localStorage.setItem('user_name', userName);
            localStorage.setItem('email', e_mail);

            $("#enter-form").css("display", "none");
            $("#personal-data").css("display", "flex");
            $("#user_name").html(userName);
            $("#user_email").html(e_mail);
        }

    });
}



$("#log-out").click(function () {
    $("#personal-data").css("display", "none")
    $("#enter-form").css("display", "flex");
});



let search_law_form_element = document.getElementById('search-law-form');
if (search_law_form_element) {
    search_law_form_element.addEventListener('submit', async (event) => {
        event.preventDefault();
        const chapter = $("#chapter").val();
        const num = $("#num").val();
        const directory = "second_folder";
        let id = account.user_name + "-" + directory + "-" + chapter + "-" + num;

        const response = await fetch(`${config.apiUrl}/questions/${chapter}/${num}`);
        const tableHtml = await response.text();

        const tableContainer = document.getElementById('result-area') as HTMLElement;
        tableContainer.innerHTML = tableHtml;// 清空表格

        if (event.target && event.target instanceof HTMLFormElement) {
            event.target.reset();
        }

    });
}

/*nav區切換*/

(document.getElementById('search-btn') as HTMLElement).addEventListener('click', () => {
    (document.getElementById('search-area') as HTMLElement).style.display = 'flex';
    (document.getElementById('record-area') as HTMLElement).style.display = 'none';
    (document.getElementById('test-area') as HTMLElement).style.display = 'none';
    (document.getElementById('enter-area') as HTMLElement).style.display = 'none';
});

(document.getElementById('user-btn') as HTMLElement).addEventListener('click', () => {
    (document.getElementById('search-area') as HTMLElement).style.display = 'none';
    (document.getElementById('record-area') as HTMLElement).style.display = 'none';
    (document.getElementById('test-area')  as HTMLElement).style.display = 'none';
    (document.getElementById('enter-area')  as HTMLElement).style.display = 'block';
});

(document.getElementById('record-btn')  as HTMLElement).addEventListener('click', async () => {
    (document.getElementById('search-area')  as HTMLElement).style.display = 'none';
    (document.getElementById('test-area')  as HTMLElement).style.display = 'none';
    (document.getElementById('enter-area')  as HTMLElement).style.display = 'none';
    if (enter_or_not) {
        (document.getElementById('record-area')  as HTMLElement).style.display = 'block';

        await load_all_dir();
    }
});

(document.getElementById('test-btn') as HTMLElement).addEventListener('click', () => {
    (document.getElementById('search-area') as HTMLElement).style.display = 'none';
    (document.getElementById('record-area') as HTMLElement).style.display = 'none';
    (document.getElementById('test-area') as HTMLElement).style.display = 'flex';
    (document.getElementById('enter-area') as HTMLElement).style.display = 'none';
});


/*資料夾區域*/
$(function () {
    // 使用事件委託，將事件處理程序附加到父元素上
    $("#record_table").on("click", ".record-button", async function () {
        $("#show-words").remove();
        $("#show-words").fadeOut(1000);
        const buttonText = $(this).text();
        const [element1, element2] = buttonText.split('-');
        const response = await fetch(`${config.apiUrl}/questions/${element1}/${element2}`);
        const tableHtml = await response.text();
        $("#record_show").append(`<div id='show-words' style='display: none;'>${tableHtml}</div>`);
        $("#show-words").fadeIn(1000);
    });
});

// 載入與展示所有資料夾
async function load_all_dir() {
    let key = (account.token as string).toString().replace(/"/g, '');
    try {
        // 發送 GET 請求，並等待回應
        const response = await fetch(`${config.apiUrl}/all_dir/${account.user_name}`, {
            method: 'GET',
            headers: {
                'Authorization': key,
            }
        });

        // 確保請求成功
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // 解析回應內容
        const data = await response.text(); // 如果後端回傳 HTML，使用 text()，如果回傳 JSON，則使用 json()

        // 成功取得資料，將回應內容加入到 #dir
        $("#dir").html(data);
        $("#dir").append("<li class='add-dir'>新增資料</li>");

        // 設置樣式
        $(".add-dir, .the-dir").css({
            "padding": "10px 10px",
            "font-size": "20px"
        });
    } catch (error) {
        // 捕捉到錯誤，進行錯誤處理
        console.error("Error fetching data:", error);
    }
}


/*法條區域*/

// 總搜索表單
$("#law-search-area-form").submit(function (event) {
    event.preventDefault();
    const chapter = $("#search-chapter").val() as string;
    $("#law-search-area").css("display", "none");
    $("#show-type-nav").css("display", "flex");
    $(".chapter_is").html(chapter);
    if (event.target && event.target instanceof HTMLFormElement) {
        event.target.reset();
    }
});

// 跳轉區域
$("#show-type-chapter").click(async function (event) {
    event.stopPropagation();
    $("#law-show-area").css("display", "block");
    await load_all_search_chapters($(".chapter_is").html());
    $("#show-type-nav").css("display", "none");
});

$("#show-type-all").click(async function (event) {
    event.stopPropagation();
    $("#all-lines-area").css("display", "block");
    await load_all_lines($(".chapter_is").html());
    $("#show-type-nav").css("display", "none");
});

$(".back-to-nav").click(function () {
    $("#law-show-area").css("display", "none");
    $("#all-lines-area").css("display", "none");
    $("#show-type-nav").css("display", "flex");
});

$(".back-to-search").click(function () {
    $("#show-type-nav").css("display", "none");
    $("#law-search-area").css("display", "flex");
});

/*顯示全部法律區域*/

// chapter: 法條名稱，如:刑法、民法
// 獲取全部法條，並貼上
async function load_all_lines(chapter: string) {
    $.ajax({
        url: `${config.apiUrl}/questions/all_lines/${chapter}`,
        method: 'GET',
        success: function (response) {
            // 將回應內容加入到 #all-lines
            $("#all-lines").html(`${response}`);

            // 動態加入 CSS 樣式
            $("<style>")
                .prop("type", "text/css")
                .html(`
                    .law-content {
                        margin-bottom: 20px;
                        padding: 5px 0;
                    }
                    .law-chapter {
                        font-weight: bold;
                        text-align: left;
                    }
                    .law-lines {
                        text-align: left;
                    }
                    .chapter-li a:hover {
                        background-color: #111;
                    }
                `)
                .appendTo("head");
        },
        error: function (xhr, status, error) {
            console.log("Error: " + error);
        }
    });
}


/*按章節搜尋區域*/

// 顯示章節作為左邊的nav
async function load_all_search_chapters(chapter: string) {
    $.ajax({
        url: `${config.apiUrl}/search/${chapter}`,
        method: 'GET',
        success: function (response) {
            // 將回應內容加入到 #all-lines
            $("#chapter-ul").html(response);

            $("<style>")
                .prop("type", "text/css")
                .html(`
                .chapter-ul-2 {
                    margin-left: 0; /* 移除縮排 */
                    position: relative; /* 保持在文檔流中 */
                    display: none; /* 預設隱藏 */
                    transform: scaleY(0); /* 初始狀態為縮放為 0，隱藏 */
                    transform-origin: top; /* 縮放的基準點設定為頂部 */
                    transition: transform 0.3s ease-out;
                }
                
                
                li li{
                    float:none;
                    border-top:1px solid #7F9492;
                }
                
                
                .chapter-ul-1 {
                    position: relative; /* 成為子層的參考點 */
                }
                
                /* 展開子層 */
                .chapter-li-1:hover > .chapter-ul-2 {
                    display: block; /* 顯示子層 */
                    transform: scaleY(1); /* 展開到正常大小 */
                }
                `)
                .appendTo("head");
        },
        error: function (xhr, status, error) {
            console.log("Error: " + error);
        }
    });
}



async function load_all_chapters() {
    $.ajax({
        url: `${config.apiUrl}/all_chapters`,
        method: 'GET',
        success: async function (response) {
            // 將回應內容加入到 #all-lines
            $("#law-name-data").html(response);
        },
        error: function (xhr, status, error) {
            console.log("Error: " + error);
        }
    });
}




/*選單隨畫面卷動*/
$(function () {
    $(window).scroll(function () {
        $("#nav-chapter").stop().animate({"top": $(window).scrollTop() as number + 100},
            500);
    });
});


//下拉式選單
$(document).on('mouseenter', '.chapter-ul-1 > li', function () {
    // 關閉同層其他的 ul
    $(this).siblings().children("ul").stop().slideUp(100);
    // 展開當前 ul
    $(this).children("ul").stop().slideDown(100);
});

$(document).on('mouseleave', '.chapter-ul-1 > li', function () {
    // 隱藏當前 ul
    $(this).children("ul").stop().slideUp(100);
});


$(document).on('click', '.chapter-li-1 > a', function (event) {
    event.stopPropagation(); // 停止事件冒泡
    const chapter1 = $("#chapter_is_law_show").text();
    const chapter2_html = $(this).html();
    const chapter2 = chapter2_html.replace(/<[^>]*>/g, '');
    $.ajax({
        url: `${config.apiUrl}/lines_by_chapter/${chapter1}/1/${chapter2}`,
        method: 'GET',
        success: function (response) {
            // 將回應內容加入到 #all-lines
            $("#ttt").html(response);
        },
        error: function (xhr, status, error) {
            console.log("Error: " + error);
        }
    });
    $("#chapter-ul").css("display", "block");
});

$(document).on('click', '.chapter-li-2 > a', function (event) {
    event.stopPropagation(); // 停止事件冒泡
    const chapter1 = $("#chapter_is_law_show").text();
    const chapter2_html = $(this).html();
    const chapter2 = chapter2_html.replace(/<[^>]*>/g, '');
    $.ajax({
        url: `${config.apiUrl}/lines_by_chapter/${chapter1}/2/${chapter2}`,
        method: 'GET',
        success: function (response) {
            // 將回應內容加入到 #all-lines
            $("#ttt").html(response);
        },
        error: function (xhr, status, error) {
            console.log("Error: " + error);
        }
    });
    $("#chapter-ul").css("display", "block");
});


/*關於records*/

// 進入
$(document).on('click', '.the-dir', async function () {// 停止事件冒泡
    await loadQuestions($(this).text());
    await loadFile(account.user_name as string, $(this).text());
    $("#in_folder").css("display", "block");
    $("#dir").css("display", "none");
    $(".record-footer").css("display", "flex");
    $("#folder-name").html($(this).text());
    $(".header-container").addClass("hideproperty");
});

$(document).on('click', '#delete-dir', async function () {// 停止事件冒泡
    let dir = $("#folder-name").text();
    let answer = confirm(`確認刪除資料夾${dir}?`);
    if (answer) {
        $.ajax({
            url: `${config.apiUrl}/delete_dir_by_name/${dir}`,
            method: 'DELETE',
            success: async function (response) {
                alert("刪除成功")
                $("#dir").css("display", "grid");
                $("#record_table").css("display", "none");
                $(".record-footer").css("display", "none")
            },
            error: function (xhr, status, error) {
                alert("刪除失敗")
            }
        });

        await delete_file(account.user_name as string, dir as  string);
        $("#dir").css("display", "grid");
        $("#in_folder").css("display", "none");
        $(".record-footer").css("display", "none");
        $(".header-container").removeClass("hideproperty");
    }

});

async function loadQuestions(directory: string) {

    $.ajax({
        url: `${config.apiUrl}/records_to_laws/${account.user_name}/${directory}`,
        method: 'GET',
        success: function (response) {
            $("#record_table").html(response);
        },
        error: function (xhr, status, error) {
            alert("失敗");
            console.log("Error: " + error);
        }
    });

}

//編輯器與卡片區的轉換
$("#record-card-btn").click(function () {
    $("#record_table").css("display", "block");
    $(".record-footer").css("display", "flex");
    $("#record-editor").css("display", "none");
});

// 宣告宿主區域

let host = document.getElementById('word-area') as HTMLElement;
let globalShadowRoot = host.attachShadow({ mode: 'open' });

async function loadFile(user_name: string, dir: string) {
    var id = user_name + "-" + dir;
    $.ajax({
        url: `${config.apiUrl}/file_html/${id}`,
        method: 'GET',
        success: function (response) {
            var file = File.from_api_v2(response);

            globalShadowRoot.innerHTML =
                `<style>
                    ${file.css}
                </style>
                ${file.content}
    `;
            let number = file.content.length;
            $("#text-number").html(number.toString);
        },
        error: function (xhr, status, error) {
            alert("失敗");
            console.log("Error: " + error);
        }
    });
}

$("#record-editor-btn").click(async function () {
    $("#record_table").css("display", "none");
    $("#record-editor").css("display", "block");
    $(".record-footer").css("display", "flex");
    if (account.user_name) {
        await loadFile(account.user_name, $("#folder-name").text());
    }
});

$("#back_to_folder").click(async function () {
    $("#dir").css("display", "grid");
    $("#in_folder").css("display", "none");
    $(".record-footer").css("display", "none");
    $(".header-container").removeClass("hideproperty");
    await load_all_dir();
});



$(document).on('click', '.add-dir', function () {
    const popHTML = `
                <div class="popup" id="popup2">
                <div class="popup-content">
                <div class="popup-header">
                    <h3>加入資料夾</h3>
                    <span class="close-btn" id="hidePopup2">X</span>
                </div>
                <div class="popup-body">
                    <form id="create-dir-form" style="display: flex; flex-direction: column;">
                        <input type="text" id="dir-name" placeholder="目錄名稱" required>
                        <button type="submit">創建</button>
                    </form>
                </div>
                </div>
                </div>`
    document.body.insertAdjacentHTML('beforeend', popHTML);

    // 顯示彈出視窗
    (document.getElementById('popup2') as HTMLElement).style.display = 'flex';

    $(document).on('submit', '#create-dir-form', async function (event) {
        event.preventDefault();
        const dir = $("#dir-name").val();
        await add_to_dir("創建", "創建", account.user_name as string, dir as string);
        await load_all_dir();
        event.target.reset();
    });
});

$(document).on('click', '#hidePopup2', function () {
    $("#popup2").remove();
});


$(document).on('click', '.add-law', function () {
    const buttonId = $(this).attr('id');
    // 顯示彈出視窗
    showPopup();

    // 將按鈕的 id 顯示在 #pop-law 裡面
    $("#pop-law").html(`${buttonId}`);
});

function showPopup() {
    // 建立彈出視窗的 HTML
    const popupHTML = `
        <div class="popup" id="popup">
            <div class="popup-content">
                <div id="pop-law" style="display: none"></div>
                <div class="popup-header">
                    <h3>加入資料夾</h3>
                    <span class="close-btn" id="hidePopup1">X</span>
                </div>
                <div class="popup-body" id="popup-options">
                    <!-- 選項將會在這裡動態插入 -->
                </div>
                <button id="addFolder">新增資料夾</button>
                <form id="add_dir_form" style="display: none;">
                    <input type="text" id="pop-dir-name" placeholder="目錄名稱" required>
                    <button type="submit">創建</button>
                </form>
                <div class="popup-footer">
                    <button id="confirmSelection">確定</button>
                </div>
            </div>
        </div>
    `;

    // 插入彈出視窗到 body
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // 顯示彈出視窗
    (document.getElementById('popup') as HTMLElement).style.display = 'flex';

    // 發送 AJAX 請求並將結果插入到 .popup-body
    $.ajax({
        url: `${config.apiUrl}/dir_for_pop/${account.user_name}`,
        method: 'GET',
        success: function (response) {
            // 將回應內容加入到 #popup-options
            $("#popup-options").html(response);
        },
        error: function (xhr, status, error) {
            console.log("Error: " + error);
        }
    });

    $(document).on('submit', '#add_dir_form', async function (event) {
        event.preventDefault(); // 阻止表單提交後刷新頁面
        const dirName = $("#pop-dir-name").val();

        if (dirName) {
            await add_to_dir("創建", "創建", account.user_name as string, dirName as string);
            alert(`創建的資料夾名稱: ${dirName}`);
            $("#add_dir_form").css("display", "none");
            $.ajax({
                url: `${config.apiUrl}/dir_for_pop/${account.user_name}`,
                method: 'GET',
                success: function (response) {
                    // 將回應內容加入到 #popup-options
                    $("#popup-options").html(response);
                },
                error: function (xhr, status, error) {
                    console.log("Error: " + error);
                }
            });
        } else {
            alert("請輸入資料夾名稱");
        }
    });
}


function hidePopup() {
    // 移除彈出視窗元素
    const popup = document.getElementById('popup');
    if (popup) {
        popup.remove();
    }
}

$(document).on('click', '#hidePopup1', function () {
    $("#popup").remove();
});

$(document).on('click', '#addFolder', function () {
    $("#add_dir_form").css("display", "flex");
});



$(document).on('click', '#confirmSelection', function () {
    // 獲取所有被打勾的 checkbox
    const checkedOptions = document.querySelectorAll('.popup-body input[type="checkbox"]:checked');

    // 用來儲存選中的資料夾名稱
    const selectedFolders: string[] = [];

    const [element1, chapter, num] = $("#pop-law").text().split('-');

    // 遍歷每個被打勾的 checkbox，並獲取其相對應的 label 文字
    checkedOptions.forEach(option => {
        // 獲取對應的 label 文字
        const label = option.nextElementSibling as HTMLElement; // label 緊跟在 checkbox 後面
        if (label) {
            selectedFolders.push(label.innerText);
        }
    });

    // 顯示選中的資料夾名稱
    if (selectedFolders.length > 0) {
        selectedFolders.forEach(dir => {
            add_to_dir(chapter, num, account.user_name as string, dir as string);
        });
        alert('成功新增');
    } else {
        alert('沒有選中的資料夾');
    }
    $("#popup").remove();
});

async function add_to_dir(chapter: string, num: string, user_name: string, directory: string) {
    let id = user_name + "-" + directory + "-" + chapter + "-" + num;
    const question = {id: id, chapter: chapter, num: num, user_name: user_name, directory: directory, note: "新增筆記"};
    const url = `${config.apiUrl}/questions/${chapter}/${num}`;

    try {
        if (chapter != "創建") {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('無此條目');
            }
        } else {
            await add_file(user_name, directory, "# 請用markdown寫入筆記!", "no");
        }
        // 如果 response 有回傳數據且你需要使用的話
        await fetch(`${config.apiUrl}/questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(question),
        });
        alert("成功加入");
    } catch (error: unknown) {
        if (error instanceof Error) {
            // 現在 TypeScript 知道這是一個 Error 對象，可以安全地訪問 .message 屬性
            alert(error.message);
            console.log("Error: " + error.message);
        } else {
            // 如果錯誤不是 Error 對象，處理其他類型的錯誤或記錄通用錯誤信息
            alert("An unknown error occurred");
            console.log("Error: ", error);
        }
    }
}


/*顯示資料夾內筆記*/
$(document).on('click', '.toggle-note-law', function () {
    const [element1, element2, chapter, num] = ($(this).attr('id') as string).split('-');
    let law_note = "#" + "card-law-note" + "-" + chapter + "-" + num;
    $(law_note).css("display", "flex");
});


//隱藏筆記部分
$(document).on('click', '.note-hide-btn', function () {
    const [element1, element2, element3, chapter, num] = ($(this).attr('id') as string).split('-');
    let law_note = "#" + "card-law-note" + "-" + chapter + "-" + num;
    $(law_note).css("display", "none");
});

//編輯筆記
$(document).on('click', '.note-edit-btn', function () {
    const [element1, element2, element3, chapter, num] = ($(this).attr('id') as string).split('-');
    let note_area_id = "#law-note-area-" + chapter + "-" + num;
    let original_note = $(note_area_id).html();
    const formHTML = `
        <form class="law-note-form" id="law-note-form-${chapter}-${num}">
            <textarea class="note-form-text" id="note-form-text-${chapter}-${num}">${original_note}</textarea>
            <button class="note-form-btn" type="submit"></button>
        </form>
    `;
    $(note_area_id).html(formHTML);
});

// 將提交事件處理器移出點擊事件處理器外部
$(document).on('submit', '.law-note-form', async function (event) {
    event.preventDefault(); // 阻止表單提交後刷新頁面
    let formId = $(this).attr('id') as string;
    let textareaId = `#note-form-text-${formId.split('-')[3]}-${formId.split('-')[4]}`;
    let new_note = $(textareaId).val() as string;
    await update_note(account.user_name as string, $("#folder-name").text(), formId.split('-')[3],  formId.split('-')[4], new_note);
    let note_area_id = "#law-note-area-" + formId.split('-')[3] + "-" + formId.split('-')[4];
    $(note_area_id).html(new_note);
});

async function update_note(user: string, dir: string, chapter: string, num: string, note: string) {
    let id = user + "-" + dir + "-" + chapter + "-" + num;
    $.ajax({
        url: `${config.apiUrl}/update_note/${id}`,
        method: 'PUT',
        contentType: 'application/json', // 确保发送 JSON 格式
        data: JSON.stringify({ note: note }), // 将 note 包装在 JSON 对象中
        success: function (response) {
            alert("ff");
        },
        error: function (xhr, status, error) {
            alert("更新失败");
            console.log("Error: " + error);
        }
    });
}




$(document).on('submit', '.card-add-form', async function (event) {
    event.preventDefault(); // 阻止表單提交後刷新頁面
    let folder = $("#folder-name").text();
    let chapter = $("#card-form-chapter").val();
    let num = $("#card-form-num").val();

    // 確保add_to_dir完全執行後，再執行loadQuestions
    await add_to_dir(chapter as string, num as string, account.user_name as string, folder as string);
    await loadQuestions(folder);

});



$(document).ready(function() {
    load_editor();
})






$("#record-viewer-tools-edit").click(async function() {
    $("#record-writer").css("display", "block");
    $("#record-viewer").css("display", "none");
    $(".record-footer").css("display", "none");
    let id = account.user_name+ "-" + $("#folder-name").text();


    // 使用 fetch 發送 GET 請求
    fetch(`${config.apiUrl}/file_html/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // 或 response.text() 如果期望的是文本
        })
        .then(async data => {
            const content = File.from_api_v2(data).content;
            await updateEditorContent(content);
        })
        .catch(error => {
            alert("失敗");
            console.log("Error: " + error.message);
        });
});


// 處理確認修改筆記
$("#confirm-edit").click(async function () {
    let text = $("#preview").html();

    let id = account.user_name + "-" + $("#folder-name").text();
    let content = $(".ck-content").html();

    //更新筆記內容
    async function update_content() {
        try {
            const response = await fetch(`${config.apiUrl}/file/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: content })
            });
            var css_from_response = await File.from_api_v2(await response.json());
        } catch (error) {
            alert("更新失败");
            console.error("Error: ", error);
        }
    }

    async function update_word_area() {
        try {
            const response = await fetch(`${config.apiUrl}/file_html/${id}`, {
                method: 'GET'
            });
            if (!response.ok) {
                throw new Error("获取数据失败");
            }
            var file = await File.from_api_v2(await response.json());
            globalShadowRoot.innerHTML = `<style>${file.css}</style>${file.content}`;

            // 更新筆記字數
            let number = $("#word-area").text().length;
            $("#text-number").html(number.toString);
        } catch (error) {
            console.error("Error: ", error);
        }
    }

// 依次调用两个函数
    async function performUpdates() {
        await update_content();
        await update_word_area();
    }

    await performUpdates();




    $("#record-writer").css("display", "none");
    $("#record-viewer").css("display", "flex");
    $(".record-footer").css("display", "flex");
});


async function delete_file(user_name: string, directory: string) {
    let id = user_name + "-" + directory;
    try {
        let res = await fetch(`${config.apiUrl}/file/${id}`, {
            method: 'DELETE',
        });
        alert("成功加入"+ res);
    } catch (error: unknown) {
        if (error instanceof Error) {
            // 現在 TypeScript 知道這是一個 Error 對象，可以安全地訪問 .message 屬性
            alert(error.message);
            console.log("Error: " + error.message);
        } else {
            // 如果錯誤不是 Error 對象，處理其他類型的錯誤或記錄通用錯誤信息
            alert("An unknown error occurred");
            console.log("Error: ", error);
        }
    }
}


async function add_file(user_name: string, directory: string, content: string, css: string) {
    let id = user_name + "-" + directory;
    const file = {id: id, content: content, css: css, user_name: user_name, directory: directory};

    try {
        await fetch(`${config.apiUrl}/file`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(file),
        });
        alert("成功加入");
    } catch (error: unknown) {
        if (error instanceof Error) {
            // 現在 TypeScript 知道這是一個 Error 對象，可以安全地訪問 .message 屬性
            alert(error.message);
            console.log("Error: " + error.message);
        } else {
            // 如果錯誤不是 Error 對象，處理其他類型的錯誤或記錄通用錯誤信息
            alert("An unknown error occurred");
            console.log("Error: ", error);
        }
    }
}

import { editorConfig } from './types/ck.ts';
import {ClassicEditor, EditorConfig,} from 'ckeditor5';



let editorInstance: ClassicEditor;

function load_editor() {
    ClassicEditor
        .create((document.querySelector('#markdown') as HTMLElement), editorConfig as EditorConfig)
        .then(editor => {
            editorInstance = editor;
            $(".ck-toolbar__items").append(`<span>法律相關：</span><button class="ck ck-button ck-disabled ck-off", id="ck-law">插入法條</button>`);
            $(".ck-toolbar__items").append(`<button class="ck ck-button ck-disabled ck-off", id="ck-law-card">插入卡片</button>`);
            $(".ck-toolbar__items").append(`<button class="ck ck-button ck-disabled ck-off", id="ck-law-css">編輯css</button>`);
        })
        .catch(error => {
            console.error('There was a problem initializing the editor:', error);
        });
}


$(document).on('click', '#ck-law-card', function () {
    editorInstance.model.change(writer => {
        editorInstance.model.insertContent(writer.createText( 'law-card-insertion-place'));
    });
    show_lawcard_Popup();
});




function show_lawcard_Popup() {
    // 建立彈出視窗的 HTML
    const popup_content = `
        <div class="popup-content" style="flex: 0 0 50%">
                <div class="popup-header">
                    <h3>加入資料夾</h3>
                    <span class="close-btn" id="hide-popup-law-card">X</span>
                </div>
            <div class="popup-body">
                <form id="insert-law-card">
                    <input list="law-name-data" id="insert-law-card-chapter">
                    <datalist id="law-name-data">
                        <option value="民法">
                        <option value="中華民國刑法">
                        <option value="憲法">
                    </datalist>
                    <input id='insert-law-card-num' placeholder="條目" required></input>
                    <button type="submit">查詢</button>
                </form>
                <div class="popup-footer">
                    <button id="confirm_card">確定</button>
                </div>
            </div>
        </div>`;

    const popup_preview = `
    <div id="card-preview" style="flex: 0 0 50%">
    <h3>預覽</h3>
    <div id="view-bar">
        <div class="law-block"></div>
    </div>
</div>
    `


    const popupHTML = `
        <div class="popup" id="popup-law-card">
            <div id="law-card-flex" style="display: flex; flex-direction: row">      
                ${popup_preview}
                ${popup_content}
            </div>
        </div>
    `;

    // 插入彈出視窗到 body
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // 顯示彈出視窗
    (document.getElementById('popup-law-card') as HTMLElement).style.display = 'flex';


    $(document).on('click', '#hide-popup-law-card', function () {
        $("#popup-law-card").remove();
    });

    $(document).on('click', '#confirm_card', async function () {
        const law_block = $("#view-bar").html();
        let old_content = $(".ck-content").html();
        const LawBlock = {old_content: old_content, new_content:law_block };

        try {
            let res = await fetch(`${config.apiUrl}/law_block`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(LawBlock),
            });
            let t= await res.text();
            await updateEditorContent(t);
            $("#popup-law-card").remove();
        } catch (error: unknown) {
            if (error instanceof Error) {
                // 現在 TypeScript 知道這是一個 Error 對象，可以安全地訪問 .message 屬性
                alert(error.message);
                console.log("Error: " + error.message);
            } else {
                // 如果錯誤不是 Error 對象，處理其他類型的錯誤或記錄通用錯誤信息
                alert("An unknown error occurred");
                console.log("Error: ", error);
            }
        }
    });


}


$(document).on('submit', '#insert-law-card', async function (event) {
    event.preventDefault(); // 阻止表單提交後刷新頁面
    const chapter = $("#insert-law-card-chapter").val();
    const num = $("#insert-law-card-num").val();
    let id= chapter + "-" + num;
    let law = await load_law(id) as Law;
    $(".law-block").append(law.one_card());
    event.target.reset();
});


async function updateEditorContent(newContent: string) {
    if (editorInstance) {
        editorInstance.setData(newContent);
    } else {
        console.error('Editor has not been initialized yet.');
        setTimeout(() => updateEditorContent(newContent), 1000);  // 延遲1秒後重試
    }
}





import {Law} from './types/Law.ts';

async function load_law(id: string) {
    let [chapter, num] = id.split("-");

    try {
        const response = await fetch(`http://localhost:9090/one_law/${chapter}/${num}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();// 假設回應是 JSON 格式

        let new_law = new Law(num, chapter, data.lines);
        return new_law;  // 返回 Law 物件
    } catch (error) {
        console.error("Error:", error);
        return null; // 或者根據需要處理錯誤時的返回值
    }
}

