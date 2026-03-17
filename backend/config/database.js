import { Sequelize } from "sequelize";

const sequelize = new Sequelize("postdb", "postname", "password", {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});

const initializeDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("postgresql connected...");
  } catch (err) {
    console.error("unable to connect postgress", err);
  }
};

initializeDB();

export default sequelize;
