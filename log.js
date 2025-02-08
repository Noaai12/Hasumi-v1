const chalk = require('chalk');
const gradient = require('gradient-string');

class Logger {
    static loading = {
        start: 0,
        frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
        intervals: {}
    };

    static log(text, type = 'log') {
        const timestamp = chalk.gray(`[${new Date().toLocaleTimeString()}]`);
        const prefix = gradient.fruit('ZER');
        
        switch(type.toLowerCase()) {
            case 'error':
                console.log(`${timestamp} ${prefix} ${chalk.red('❌')} ${chalk.red(text)}`);
                break;
            case 'warning':
                console.log(`${timestamp} ${prefix} ${chalk.yellow('⚠')} ${chalk.yellow(text)}`);
                break;
            case 'success':
                console.log(`${timestamp} ${prefix} ${chalk.green('✓')} ${chalk.green(text)}`);
                break;
            case 'info':
                console.log(`${timestamp} ${prefix} ${chalk.blue('ℹ')} ${chalk.blue(text)}`);
                break;
            case 'load':
                return this.loading(text);
            default:
                console.log(`${timestamp} ${prefix} ${chalk.white(text)}`);
        }
    }

    static loading(text, id = 'default') {
        if (this.loading.intervals[id]) {
            clearInterval(this.loading.intervals[id]);
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            return;
        }

        let i = 0;
        this.loading.intervals[id] = setInterval(() => {
            const frame = this.loading.frames[i = ++i % this.loading.frames.length];
            const timestamp = chalk.gray(`[${new Date().toLocaleTimeString()}]`);
            const prefix = gradient.fruit('ZER');
            
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`${timestamp} ${prefix} ${chalk.cyan(frame)}`);
        }, 80);

        return this.loading.intervals[id];
    }

    static success(text) {
        this.log(text, 'success');
    }

    static error(text) {
        this.log(text, 'error');
    }

    static warn(text) {
        this.log(text, 'warning');
    }

    static info(text) {
        this.log(text, 'info');
    }

    static load(text) {
        return this.log(text, 'load');
    }

    static stopLoading(id = 'default') {
        if (this.loading.intervals[id]) {
            clearInterval(this.loading.intervals[id]);
            delete this.loading.intervals[id];
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
        }
    }
}

module.exports = Logger;