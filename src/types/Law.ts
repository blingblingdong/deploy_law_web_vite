export class Law {
    num: string;
    chapter: string;
    lines: string;

    constructor(num: string, chapter: string, lines: string) {
        this.num = num;
        this.chapter = chapter;
        this.lines = lines;
    }

    one_show(enter_state: boolean): string {
        let buffer = `<ul class="law-block-lines">`;
        // 使用 for...of 來迭代 lines 向量，並將每一行包裝在 <li> 中
        for (let line of this.lines) {
            buffer += `<li class="law-block-line">${line}</li>`;
        }

        buffer += `</ul>`;
        let add_button = "";
        if (enter_state){
            add_button = `<div class='top-law_search-add-area'><button class='add-law normal-button' id='add-${this.chapter}-${this.num}'>新增至</button></div>`
        }

        let block = `
        <div class="top-search-law-area">
            <div class="law-content-area">
                <div class="top-search-law-title" style="display: flex">
                    <h2>${this.chapter}<br>第${this.num}條</h2>
                    <div>${add_button}</div>
                </div>
                ${buffer}
            </div>
        </div>
        <i class="fa-solid fa-caret-left pre-but"></i>
        <i class="fa-solid fa-caret-right next-but"></i>
`



        return block;

    }

    one_card(): string {
        let lines = this.lines;
        let buffer = `<ul class="law-block-lines">`;
        // 使用 for...of 來迭代 lines 向量，並將每一行包裝在 <li> 中
        for (let line of lines) {
            buffer += `<li class="law-block-line">${line}</li>`;
        }

        buffer += `</ul>`;

        // 完整的卡片結構
        let card = `
        <div class="law-block-content-multiple">
          <p class="law-block-chapter"><span class="law-block-chapter">${this.chapter}</span>第${this.num}條</p>
          ${buffer}
        </div>
    `;

        // 返回生成的 HTML 字串
        return card;
    }

    static from_json(data: any): Law {
        // 假設 data 是一個 JSON 字串，先解析
        if (typeof data === 'string') {
            data = JSON.parse(data);
        }

        // 返回新的 Law 實例
        return new Law(data.num, data.chapter, data.lines);
    }
}

export async function load_law(id: string, ApiUrl: string) {
    let [chapter, num] = id.split("-");

    try {
        const response = await fetch(`${ApiUrl}/one_law/${chapter}/${num}`);

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