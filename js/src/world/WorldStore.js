import sqlite3 from 'sqlite3';
const _sqlite3 = sqlite3.verbose();

export default class WorldStore {
    constructor(dbName=':memory:') {
        this.db = new _sqlite3.Database(dbName, (err) => {
            if (err) throw err;
        });

        this.createDb();
    }

    createDb() {
        this.db.exec(`
            CREATE TABLE Chunks (
                p INTEGER,
                q INTEGER,
                dx INTGER,
                dy INTEGER,
                dz INTEGER,
                PRIMARY KEY (p, q)
            );
            `, (err) => {
                if (err) throw err;
            });
    }

    loadChunk(p, q) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM Chunks WHERE p = ? AND q = ?`, p, q,
                (err, chunk) => {
                    if (err) reject(err);
                    else resolve(chunk);
                });
        });
    }

    saveChunk({ p, q, dx, dy, dz }) {
        this.db.run(`
            INSERT INTO Chunks (p, q, dx, dy, dz)
                VALUES ($p, $q, $dx, $dy, $dz)
                ON CONFLICT(p, q) DO UPDATE SET
                    dx=$dx, dy=$dy, dz=$dz;`, {
            $p: p,
            $q: q,
            $dx: dx,
            $dy: dy,
            $dz: dz
        }, (err) => {
            if (err) throw err;
            console.log("Saved chunk");
        });
    }
}