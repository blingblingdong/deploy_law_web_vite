export class Account {
    user_name: string;
    user_email: string;
    token: string;

    constructor(user_name: string, user_eamil: string) {
        this.user_name = user_name;
        this.user_email = user_eamil;
        this.token = "";
    }

   async find_token(apiurl: string) {
       try {
           // 如果 response 有回傳數據且你需要使用的話
           let response = await fetch(`${apiurl}/find_token_in_redis/${this.user_name}`, {
               method: 'POST',
           });
           if (response.ok) {
               let tk = await response.text();
               this.token = tk;
               return true;
           } else {
               return false;
           }
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

   async login(password:string, apiurl: string) {
       try {
           const response = await fetch(`${apiurl}/login`, {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                   user_name: this.user_name,
                   email: this.user_email,
                   password: password
               })
           });

           if(response.ok) {
               this.token = await response.text();
               alert("登入成功!");
               return true;
           } else {
               alert("登入失敗");
               return false;
           }

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

   async registration(password: string, apiurl: string) {
       try {
           const response = await fetch(`${apiurl}/registration`, {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                   user_name: this.user_name,
                   email: this.user_email,
                   password: password
               })
           });

           if(response.ok) {
               alert("註冊成功，登入帳號即可使用!")
           }

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




}