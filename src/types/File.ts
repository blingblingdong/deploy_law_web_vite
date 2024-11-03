export class File {
    id: string;
    content: string
    css: string
    user_name: string
    directory: string
    file_name: string
    content_nav: string




    constructor(id: string, content: string, css: string, user_name: string, directory: string, file_name: string, content_nav: string) {
        this.id = id;
        this.content = content;
        this.css = css;
        this.user_name = user_name;
        this.directory = directory;
        this.file_name = file_name;
        this.content_nav = content_nav;
    }



    static from_api_v2(api_data: any) {
        return new File(api_data.id, api_data.content, api_data.css, api_data.user_name, api_data.directory, api_data.file_name, api_data.content_nav);
    }

   }

 export async function get_file(apiUrl: string, id: string): Promise<File| undefined> {
       
        const response = await fetch(`${apiUrl}/file_html/${id}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json(); // 或 response.text() 如果期望的是文本
        return new File(data.id, data.content, data.css, data.user_name, data.directory, data.file_name, data.content_nav);
 }


export async function add_file(apiUrl: string, user_name: string, directory: string, file_name: string) {
    let id = user_name + "-" + directory + "-" + file_name;
    const file = {id: id, content: "請寫入", css: "自動生成的目錄", user_name: user_name, directory: directory, file_name: file_name, content_nav: "也是自動生成的"};

    try {
        await fetch(`${apiUrl}/file`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(file),
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            // 現在 TypeScript 知道這是一個 Error 對象，可以安全地訪問 .message 屬性
                       console.log("Error: " + error.message);
        } else {
            // 如果錯誤不是 Error 對象，處理其他類型的錯誤或記錄通用錯誤信息
                       console.log("Error: ", error);
        }
    }
}

export async function update_content(apiUrl: string, id: string, content: string) {
  try {
    await fetch(`${apiUrl}/file/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content: content })
});
} catch (error) {
  console.error("Error: ", error);
}
}
