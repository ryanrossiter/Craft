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
                map BLOB,
                PRIMARY KEY (p, q)
            );
            `, (err) => {
                if (err) throw err;
            });
    }

    containsChunk(p, q) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT EXISTS(SELECT 1 FROM Chunks WHERE p = ? AND q = ?) AS 'Exists'`, p, q,
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result['Exists'] === 1);
                });
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

    saveChunk({ p, q, map }) {
        this.db.run(`
            INSERT INTO Chunks (p, q, map)
                VALUES ($p, $q, $map)
                ON CONFLICT(p, q) DO UPDATE SET map=$map;`, {
            $p: p,
            $q: q,
            $map: new Buffer(map)
        }, (err) => {
            if (err) throw err;
            console.log("Saved chunk");
        });
    }
}