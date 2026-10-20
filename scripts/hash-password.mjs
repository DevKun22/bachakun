import { randomBytes, scryptSync } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
const rl = createInterface({ input: stdin, output: stdout });
const password = await rl.question('Nhap mat khau chung (terminal se hien ky tu khi nhap): ');
rl.close();
if (password.length < 12) { console.error('Mat khau phai dai it nhat 12 ky tu.'); process.exit(1); }
const salt = randomBytes(16);
console.log('\nMEMORY_PASSWORD_HASH=scrypt$' + salt.toString('hex') + '$' + scryptSync(password, salt, 64).toString('hex'));
console.log('MEMORY_SESSION_SECRET=' + randomBytes(48).toString('hex'));
