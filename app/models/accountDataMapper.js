const debug = require('debug')('colis:dataMapper');
const CoreDataMapper = require('./CoreDataMapper');
const client = require('./helpers/database');

/** Class representing an account data mapper. */
class AccountDataMapper extends CoreDataMapper {
  static tableName = 'users';

  constructor() {
    super();
    debug('accountDataMapper created');
  }

  async findAccountByUserId(userId) {
    debug(`${this.constructor.name} findAccountByUserId`);
    const query = {
      text: `SELECT * FROM ${this.constructor.tableName} WHERE user_id = $1`,
      values: [userId],
    };
    const result = await client.query(query);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  }

  async updateAccount(userId, updatedAccountData) {
    debug(`${this.constructor.name} updateAccount`);
    const account = await this.findAccountByUserId(userId);
    if (!account) {
      throw new Error(`Account not found for user with id ${userId}`);
    }
    account.updateFromData(updatedAccountData);

    const query = {
      text: `UPDATE ${this.constructor.tableName} SET
              username = $1,
              email = $2,
              password = $3
             WHERE user_id = $4 RETURNING *`,
      values: [
        account.username,
        account.email,
        account.password,
        account.userId,
      ],
    };
    const result = await client.query(query);
    return result.rows[0];
  }
}

module.exports = new AccountDataMapper();
