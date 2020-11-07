/* eslint-disable comma-spacing */
/* eslint-disable object-curly-spacing */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
'use strict';

const await = require('await-stream-ready/lib/await');


const Controller = require('egg').Controller;


const fields = [{
  label: '用户名',
  type: 'text',
  name: 'username',
  placeholder: '用户名',
}, {
  label: '密码',
  type: 'text',
  name: 'password',
  placeholder: '密码',
}];


class ManagerController extends Controller {


  async index() {
    const { ctx, app } = this;


    const data = await ctx.page('Manager');


    await ctx.renderTemplate({
      title: '管理员管理',
      tempType: 'table',
      table: {
        // 按钮
        buttons: {
          add: '/admin/manager/create',
        },
        // 表头
        columns: [{
          title: '管理员',
          fixed: 'left',
          key: 'username',
        }, {
          title: '时间',
          key: 'created_time',
          width: 180,
          fixed: 'center',
        }, {
          title: '操作',
          width: 200,
          fixed: 'center',
          action: {
            edit(id) {
              return `/admin/manager/edit/${id}`;
            },
            delete(id) {
              return `/admin/manager/delete/${id}`;
            },
          },
        }],
        data,
      },
    });
  }

  // 创建管理员
  async create() {
    const { ctx, app } = this;
    await ctx.renderTemplate({
      title: '创建管理员',
      tempType: 'form',
      form: {
        // 提交地址
        action: '/admin/manager',
        fields,
      },
      // 新增成功跳转路径
      successUrl: '/admin/manager',
    });
  }


  async save() {
    const { ctx, app } = this;
    // 参数验证
    ctx.validate({
      username: {
        type: 'string',
        required: true,
        desc: '用户名',
      },
      password: {
        type: 'string',
        required: true,
        desc: '密码',
      },
    });
    const { username, password } = ctx.request.body;


    // 验证用户是否已经存在
    if (await app.model.Manager.findOne({
      where: { username },
    })) {
      ctx.throw(400, '用户名已存在');
    }
    // 创建用户
    const manager = await app.model.Manager.create({
      username,
      password,
    });
    if (!manager) {
      ctx.throw(400, '创建用户失败');
    }
    ctx.apiSuccess(manager);
  }

  // 编辑管理员
  async edit() {
    const { ctx, app } = this;
    const id = ctx.params.id;
    let data = await app.model.Manager.findOne({
      where: {
        id,
      },
    });
    if (!data) {
      return await ctx.pageFail('该记录不存在');
    }

    data = JSON.parse(JSON.stringify(data));
    delete data.password;

    await ctx.renderTemplate({
      id: ctx.params.id,
      title: '修改管理员',
      tempType: 'form',
      form: {
        // 提交地址
        action: '/admin/manager/' + ctx.params.id,
        fields,
        data,
      },
      // 新增成功跳转路径
      successUrl: '/admin/manager',
    });
  }

  // 删除管理员
  async delete() {
    const { ctx, app } = this;
    const id = ctx.params.id;
    await app.model.Manager.destroy({
      where: {
        id,
      },
    });
    ctx.toast('删除成功', 'success')
    ctx.redirect('/admin/manager')
  }

  // 更新数据
  async update() {
    const { ctx, app } = this;
    ctx.validate({
      id: {
        type: 'int',
        required: true,
      },
      username: {
        type: 'string',
        required: true,
      },
      password: {
        type: 'string',
      },
    });
    const id = ctx.params.id;
    const {username,password} = ctx.request.body;
    // 用户名是否被使用
    const Op = app.Sequelize.Op
    if (
      await app.model.Manager.findOne({
        where: {
          id: {
            [Op.ne]: id,
          },
          username,
        },
      })
    ) {
      return ctx.apiFail('该用户名已存在')
    }
    // 当前管理员是否存在
    const manager = await app.model.Manager.findOne({
      where: {
        id,
      },
    })
    if (!manager) {
      return ctx.apiFail('该记录不存在')
    }

    manager.username = username
    if (password) {
      manager.password = password
    }
    ctx.apiSuccess(await manager.save())
  }
}


module.exports = ManagerController;
