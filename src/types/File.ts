export class File {
    id: string;
    content: string
    css: string
    user_name: string
    directory: string




    constructor(id: string, content: string, css: string, user_name: string, directory: string) {
        this.id = id;
        this.content = content;
        this.css = css;
        this.user_name = user_name;
        this.directory = directory;
    }



    static from_api_v2(api_data: any) {
        return new File(api_data.id, api_data.content, api_data.css, api_data.user_name, api_data.directory);
    }
}
