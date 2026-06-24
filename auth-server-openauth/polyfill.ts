import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
try {
  const buf = require('node:buffer');
  if (!buf.SlowBuffer) {
    class SlowBuffer {}
    // @ts-ignore
    SlowBuffer.prototype.equal = function() { return false; };
    buf.SlowBuffer = SlowBuffer;
  }
} catch (e) {}
