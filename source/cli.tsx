#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import App from './app.js';
import { createWriteStream } from 'fs';

// Check if the output is being piped
const isPiped = !process.stdout.isTTY;

// Create a custom write stream for UI output
const uiOutputStream = createWriteStream('/dev/tty');

if (isPiped) {
    // If piped, render to the custom UI output stream
    render(<App isPiped={true} />, {
        stdout: uiOutputStream,
        stderr: uiOutputStream,
        patchConsole: false,
        exitOnCtrlC: false,
    });
} else {
    // Normal rendering for interactive use
    render(<App isPiped={false} />);
}

// Handle cleanup on exit
process.on('exit', () => {
    uiOutputStream.end();
});


// import meow from 'meow';

// This code is commented out in case we want to use it later to pass arguments to the CLI
// const cli = meow(
//     `
// 	Usage
// 	  $ aiformat

// 	Options
// 		--name  Your name

// 	Examples
// 	  $ aiformat --name=Jane
// 	  Hello, Jane
// `,
//     {
//         importMeta: import.meta,
//         flags: {
//             name: {
//                 type: 'string',
//             },
//         },
//     },
// );

