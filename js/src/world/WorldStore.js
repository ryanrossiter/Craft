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
                r INTEGER,
                map BLOB,
                PRIMARY KEY (p, q, r)
            );
            `, (err) => {
                if (err) throw err;
            });
    }

    containsChunk(p, q, r) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT EXISTS(SELECT 1 FROM Chunks WHERE p = ? AND q = ? AND r = ?) AS 'Exists'`, p, q, r,
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result['Exists'] === 1);
                });
        });
    }

    loadChunk(p, q, r) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM Chunks WHERE p = ? AND q = ? AND r = ?`, p, q, r,
                (err, chunk) => {
                    if (err) reject(err);
                    else resolve(chunk);
                });
        });
    }

    saveChunk({ p, q, r, map }) {
        this.db.run(`
            INSERT INTO Chunks (p, q, r, map)
                VALUES ($p, $q, $r, $map)
                ON CONFLICT(p, q, r) DO UPDATE SET map=$map;`, {
            $p: p,
            $q: q,
            $r: r,
            $map: new Buffer(map)
        }, (err) => {
            if (err) throw err;
            console.log("Saved chunk");
        });
    }
}