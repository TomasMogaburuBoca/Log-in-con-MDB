const parseArgs = require ('minimist')

const info = {
    alias:{
        np: "nombrePlataforma",
        vn: "versionNode",
        rss: "memoriaTotal",
        pe: "pathEjecucion",
        pf: "carpetaProyecto"
    }
}
const commandLinesArg = process.argv.slice(2)
const { np, vn, rss, pe, pf, _ } = parseArgs(commandLinesArg, info);

const infoArgs = { np, vn, rss, pe, pf, _ }
console.log(infoArgs);

exports.modules = { infoArgs };