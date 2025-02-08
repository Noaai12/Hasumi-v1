const chalk = require('chalk');

class Logger {
    static frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    static intervals = {};

    static zerLogo = `
${chalk.hex('#FF8C00')('███████╗')}${chalk.hex('#FFA500')('███████╗')}${chalk.hex('#FFB833')('██████╗ ')}
${chalk.hex('#FF8C00')('╚══███╔╝')}${chalk.hex('#FFA500')('██╔════╝')}${chalk.hex('#FFB833')('██╔══██╗')}
${chalk.hex('#FF8C00')('  ███╔╝ ')}${chalk.hex('#FFA500')('█████╗  ')}${chalk.hex('#FFB833')('██████╔╝')}
${chalk.hex('#FF8C00')(' ███╔╝  ')}${chalk.hex('#FFA500')('██╔══╝  ')}${chalk.hex('#FFB833')('██╔══██╗')}
${chalk.hex('#FF8C00')('███████╗')}${chalk.hex('#FFA500')('███████╗')}${chalk.hex('#FFB833')('██║  ██║')}
${chalk.hex('#FF8C00')('╚══════╝')}${chalk.hex('#FFA500')('╚══════╝')}${chalk.hex('#FFB833')('╚═╝  ╚═╝')}`;

    static showLogo() {
        console.log(this.zerLogo);
    }

    static log(text, type = 'log') {
        const timestamp = chalk.gray(`[${new Date().toLocaleTimeString()}]`);
        const prefix = chalk.hex('#FF8C00')('ZER');
        
        switch(type.toLowerCase()) {
            case 'error':
                console.log(`${timestamp} ${prefix} ${chalk.red('��')} ${chalk.red(text)}`);
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
                return this.startLoading(text);
            default:
                console.log(`${timestamp} ${prefix} ${chalk.white(text)}`);
        }
    }

    static startLoading(text, id = 'default') {
        if (this.intervals[id]) {
            clearInterval(this.intervals[id]);
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            return;
        }

        let i = 0;
        this.intervals[id] = setInterval(() => {
            const frame = this.frames[i = ++i % this.frames.length];
            const timestamp = chalk.gray(`[${new Date().toLocaleTimeString()}]`);
            const prefix = chalk.hex('#FF8C00')('ZER');
            
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`${timestamp} ${prefix} ${chalk.cyan(frame)} ${chalk.cyan(text)}`);
        }, 80);

        return this.intervals[id];
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
        return this.startLoading(text);
    }

    static stopLoading(id = 'default') {
        if (this.intervals[id]) {
            clearInterval(this.intervals[id]);
            delete this.intervals[id];
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
        }
    }
}

module.exports = Logger; 