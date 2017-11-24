const fs = require('fs');
const path = __dirname + '/keywords';

/**
 * 文本过滤类
 */
class TextCensor {
    constructor(keywordPath = path) {
        this.initialized = false;
        this.keywordPath = keywordPath;
        this.map = {};
    }

    /**
     * 初始化
     */
    init() {
        return new Promise(resolve => {
            if (this.initialized) {
                throw '已初始化过';
            }

            let lineReader = require('readline').createInterface({
                input: require('fs').createReadStream(this.keywordPath, { encoding: 'UTF-8' })
            });

            lineReader.on('line', line => {
                if (!line) return;
                this.addWord(line);
            });

            lineReader.on('close', _ => {
                this.initialized = true;
                resolve();
            });
        });
    }

    /**
     * 添加文本
     * @param {string} word 
     */
    addWord(word) {
        let parent = this.map;

        for (let i = 0; i < word.length; i++) {
            if (!parent[word[i]]) parent[word[i]] = {};
            parent = parent[word[i]];
        }

        parent.isEnd = true;
    }

    /**
     * 过滤
     * @param {string} s 
     */
    filter(s) {
        if (!this.initialized) {
            throw '未完成初始化';
        }

        let parent = this.map;

        for (let i = 0; i < s.length; i++) {
            if (s[i] == '*') {
                continue;
            }

            let found = false;
            let skip = 0;
            let sWord = '';

            for (let j = i; j < s.length; j++) {

                if (!parent[s[j]]) {
                    // console.log('skip ', s[j])
                    found = false;
                    skip = j - i;
                    parent = this.map;
                    break;
                }

                sWord = sWord + s[j];
                if (parent[s[j]].isEnd) {
                    found = true;
                    skip = j - i;
                    break;
                }
                parent = parent[s[j]];
            }

            if (skip > 1) {
                i += skip - 1;
            }

            if (!found) {
                continue;
            }

            let stars = '*';
            for (let k = 0; k < skip; k++) {
                stars = stars + '*';
            }

            let reg = new RegExp(sWord, 'g');
            s = s.replace(reg, stars);

        }

        return s;
    }
}

module.exports = TextCensor;