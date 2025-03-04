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

function parseTodo(todoText, fileName) {
    const important = (todoText.match(/!/g) || []).length;
    const parts = todoText.split(';').map(p => p.trim());
    let user = '', date = '', comment = todoText;
    if (parts.length === 3) {
        [user, date, comment] = parts;
    }
    return { important, user, date, comment, fileName };
}

function processCommand(command) {
    const [cmd, arg] = command.split(' ');
    switch (cmd) {
        case 'exit':
            process.exit(0);
        case 'show':
            printTable(todos);
            break;
        case 'important':
            printTable(todos.filter(todo => todo.important > 0));
            break;
        case 'user':
            printTable(todos.filter(todo => todo.user.toLowerCase() === arg.toLowerCase()));
            break;
        case 'sort':
            if (arg === 'importance') {
                printTable([...todos].sort((a, b) => b.important - a.important));
            } else if (arg === 'user') {
                printTable([...todos].sort((a, b) => (a.user || '').localeCompare(b.user || '')));
            } else if (arg === 'date') {
                printTable([...todos].sort((a, b) => (b.date || '').localeCompare(a.date || '')));
            } else {
                console.log('Invalid sort type');
            }
            break;
        case 'date':
            printTable(todos.filter(todo => todo.date && todo.date >= arg));
            break;
        default:
            console.log('wrong command');
    }
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
