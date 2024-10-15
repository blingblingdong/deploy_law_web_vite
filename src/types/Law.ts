export class Law {
    num: string;
    chapter: string;
    lines: string;

    constructor(num: string, chapter: string, lines: string) {
        this.num = num;
        this.chapter = chapter;
        this.lines = lines;
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
