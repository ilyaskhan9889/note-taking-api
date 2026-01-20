import { DataTypes } from 'sequelize';
import getSequelize from '../lib/sequelize.js';

const sequelize = getSequelize();

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: true
});

const Note = sequelize.define('Note', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  version: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'notes',
  timestamps: true,
  paranoid: true,
  version: true,
  indexes: [
    { type: 'FULLTEXT', fields: ['title', 'content'] }
  ]
});

const NoteVersion = sequelize.define('NoteVersion', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  noteId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  version: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  createdBy: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  }
}, {
  tableName: 'note_versions',
  timestamps: true,
  updatedAt: false
});

User.hasMany(Note, { foreignKey: 'userId' });
Note.belongsTo(User, { foreignKey: 'userId' });

Note.hasMany(NoteVersion, { foreignKey: 'noteId' });
NoteVersion.belongsTo(Note, { foreignKey: 'noteId' });

export {
  sequelize,
  User,
  Note,
  NoteVersion
};
