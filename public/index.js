'use strict';

const VSCode = acquireVsCodeApi();

INIT_OBJECTS();

let isControlMode;
let searchForm;

EVENT('keydown', (e) => {

    if (isControlMode === true) {

        let key = e.getKey().toLowerCase();

        // 현재 탭 종료
        if (key === 'w' || key === 'q') {
            location.href = 'about:blank';
        }

        // 데이터 저장
        if (key === 's') {

            let lines = __PAPA.unparse({
                data: hot.getData()
            });

            let content = '';
            lines.split('\n').forEach((line) => {
                line = line.trim();
                for (let i = line.length - 1; i >= 0; i -= 1) {
                    if (line[i] !== ',') {
                        line = line.substring(0, i + 1);
                        break;
                    }
                    if (i === 0) {
                        line = '';
                    }
                }
                content += line + '\n';
            });

            VSCode.postMessage({
                command: 'save',
                content: content.trim() + '\n'
            })
            e.stopDefault();
        }

        // 검색
        if (key === 'f') {

            let input;
            searchForm = FORM({
                style: {
                    position: 'fixed',
                    right: 0,
                    top: 0,
                    zIndex: 999999,
                    padding: 5,
                    borderRadius: 3,
                    backgroundColor: '#eee'
                },
                c: input = INPUT({
                    style: {
                        width: 300
                    },
                    name: 'query',
                    placeholder: 'Find'
                }),
                on: {
                    keyup: () => {
                        hot.getPlugin('search').query(input.getValue());
                        hot.render();
                    }
                }
            }).appendTo(BODY);

            hot.deselectCell();
            input.focus();
        }
    }

    if (e.getKey() === 'Control') {
        isControlMode = true;
    }

    if (e.getKey() === 'Escape') {
        searchForm.remove();
        searchForm = undefined;
    }
});

EVENT('keyup', (e) => {
    if (e.getKey() === 'Control') {
        isControlMode = false;
    }
});

global.hot = new Handsontable(document.body, {
    minRows: 1000,
    minCols: 20,
    rowHeaders: true,
    colHeaders: true,
    colWidths: 280,
    manualColumnResize: true,
    manualRowResize: true,
    search: true
});

window.addEventListener('message', (event) => {
    if (event.data.command === 'loadData') {
        hot.loadData(__PAPA.parse(event.data.content).data);
    }
});

VSCode.postMessage({
    command: 'loadData'
});