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

function printSorted(sortKey){
    let sorted = []

    if (sortKey === 'importance') {
        sorted = [...todos].sort((a, b) => b.important - a.important);
    } else if (sortKey === 'user') {
        sorted = [...todos].sort((a, b) => (a.user || '').localeCompare(b.user || ''));
    } else if (sortKey === 'date') {
        sorted = [...todos].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    } else {
        console.log('Invalid sort type');
        return;
    }

    printTable(sorted);
}

function processCommand(command) {
    const [cmd, arg] = command.split(' ');
    switch (cmd) {
        case 'exit':
            process.exit(0);
            break;
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
            printSorted(arg)
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
        todo.user || '',
        todo.date || '',
        todo.comment || '',
        todo.fileName || ''
    ]);

    rows.unshift(headers);
    const colWidths = headers.map((_, colIndex) => {
        return Math.min(
            50,
            Math.max(...rows.map(row => row[colIndex].length)) + 2
        );
    });

    function formatRow(row) {
        return row.map((cell, i) => cell.padEnd(colWidths[i])).join(' | ');
    }

    console.log(formatRow(headers));
    console.log('-'.repeat(colWidths.reduce((sum, width) => sum + width, headers.length - 1)));
    rows.slice(1).forEach(row => console.log(formatRow(row)));
    console.log('-'.repeat(colWidths.reduce((sum, width) => sum + width, headers.length - 1)));
}