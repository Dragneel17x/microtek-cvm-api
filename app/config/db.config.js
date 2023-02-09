module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "admin",            //Windows Local DB and Testing Server DB
  DB: "cvm_db",                   //macOS, Windows, Testing Server DB
  dialect: "mysql",
  timeZone: 'ist',
  main_db: "test",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

/* module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "Q@4bHP$87%89",   //Production Server DB
  DB: "cvm_db",                   //macOS, Windows, Testing Server DB
  dialect: "mysql",
  timeZone: 'ist',
  main_db: "mtek_db",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
 */