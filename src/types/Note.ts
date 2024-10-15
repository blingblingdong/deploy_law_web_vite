import {Account} from "./account.ts";
import $ from 'jquery';

export class Dir{
    dir: string;
    account: Account;

    constructor(account: Account, dir: string) {
        this.account = account;
        this.dir = dir;
    }

    async load_all_dir(apiurl: string) {
        let key = (this.account.token as string).toString().replace(/"/g, '');
        try {
            // 發送 GET 請求，並等待回應
            const response = await fetch(`${apiurl}/all_dir/${this.account.user_name}`, {
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
            alert('請求失敗，請稍後再試。');
        }
    }
}