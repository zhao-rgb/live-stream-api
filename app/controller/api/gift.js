/* eslint-disable no-unused-vars */
'use strict';

const await = require('await-stream-ready/lib/await');

const Controller = require('egg').Controller;

class GiftController extends Controller {
  // 礼物列表
  async list() {
    const { ctx, app } = this;

    ctx.apiSuccess(await app.model.Gift.findAll());
  }
}

module.exports = GiftController;
