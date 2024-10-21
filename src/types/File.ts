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
