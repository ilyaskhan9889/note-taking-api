import { Sequelize } from 'sequelize';
import config from '../config/index.js';

let sequelizeInstance;

function getSequelize() {
  if (!sequelizeInstance) {
    sequelizeInstance = new Sequelize(config.db.name, config.db.user, config.db.password, {
      host: config.db.host,
      port: config.db.port,
      dialect: 'mysql',
      logging: config.nodeEnv === 'development' ? console.log : false
    });
  }

  return sequelizeInstance;
}

export default getSequelize;
