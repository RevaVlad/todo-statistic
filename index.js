const { getAllFilePathsWithExtension, readFile } = require('./fileSystem');
const { readLine } = require('./console');
const path = require('path');

const files = getFiles();
const todos = extractTodos(files);

// ToDo: sadlmfas
console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(filePath => ({ content: readFile(filePath), fileName: path.basename(filePath) }));
}

function extractTodos(files) {
    const todoRegex = /\/\/\s*TODO[:]?\s*(.*)/gi;
    return files.flatMap(({ content, fileName }) =>
        content.split('\n')
            .map(line => {
                const match = todoRegex.exec(line);
                if (match) {
                    return parseTodo(match[1], fileName);
                }
                return null;
            })
            .filter(todo => todo)
    );
}



function printTable(data) {
    const headers = ['!', 'user', 'date', 'comment', 'file'];
    const rows = data.map(todo => [
        todo.important ? '!' : '',
        todo.user.padEnd(10),
        todo.date.padEnd(10),
        todo.comment.padEnd(50),
        todo.fileName.padEnd(20)
    ]);
    console.log(headers.join(' | '));
    console.log('-'.repeat(100));
    rows.forEach(row => console.log(row.join(' | ')));
    console.log('-'.repeat(100));
}
