module.exports = {
  //HOST: "192.168.1.7",
  HOST: "localhost",
  USER: "root",
  //USER: "testuser",
  //PASSWORD: "testuser@123",
  //PASSWORD: "admin@123",        //macOS local DB
  //PASSWORD: "admin",            //Windows Local DB and Testing Server DB
  PASSWORD: "admin",            //Testing Server ssh DB
  //PASSWORD: "Q@4bHP$87%89",   //Production Server DB
  DB: "test",                   //macOS, Windows, Testing Server DB
  //DB: "mtek_db",              //Production Server DB
  dialect: "mysql",
  timeZone: 'ist',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
