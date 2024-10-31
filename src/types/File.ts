export class File {
    id: string;
    content: string
    css: string
    user_name: string
    directory: string
    file_name: string




    constructor(id: string, content: string, css: string, user_name: string, directory: string, file_name: string) {
        this.id = id;
        this.content = content;
        this.css = css;
        this.user_name = user_name;
        this.directory = directory;
        this.file_name = file_name;
    }



    static from_api_v2(api_data: any) {
        return new File(api_data.id, api_data.content, api_data.css, api_data.user_name, api_data.directory, api_data.file_name);
    }

   }

 export async function get_file(apiUrl: string, id: string): Promise<File| undefined> {
       try {
        const response = await fetch(`${apiUrl}/file_html/${id}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json(); // 或 response.text() 如果期望的是文本
        return new File(data.id, data.content, data.css, data.user_name, data.directory, data.file_name);
    } catch (error) {
        alert(id);
        console.error("Error: " + error.message);
        return undefined;
    }}

