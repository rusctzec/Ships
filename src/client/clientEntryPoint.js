import querystring from 'query-string';
import { Lib } from 'lance-gg';
import ExClientEngine from './ExClientEngine';
import ExGameEngine from '../common/ExGameEngine';
const qsOptions = querystring.parse(location.search);

// default options, overwritten by query-string options
// is sent to both game engine and client engine
const defaults = {
    traceLevel: Lib.Trace.TRACE_NONE,
    delayInputCount: 8,
    scheduler: 'render-schedule',
    syncOptions: {
        sync: qsOptions.sync || 'extrapolate',
        localObjBending: 0.2,
        remoteObjBending: 0.5,
    }
};
let options = Object.assign(defaults, qsOptions);

// create a client engine and a game engine
const gameEngine = new ExGameEngine(options);
const clientEngine = new ExClientEngine(gameEngine, options);

clientEngine.start();