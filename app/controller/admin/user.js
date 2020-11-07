/* eslint-disable key-spacing */
/* eslint-disable indent */
/* eslint-disable object-shorthand */
/* eslint-disable prefer-const */
/* eslint-disable comma-spacing */
/* eslint-disable object-curly-spacing */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
'use strict';

const Controller = require('egg').Controller;

const fields = [
  {
    label: '用户名',
    type: 'text',
    name: 'username',
    placeholder: '用户名',
  },
  {
    label: '密码',
    type: 'text',
    name: 'password',
    placeholder: '密码',
  },
  {
    label: '头像',
    type: 'file',
    name: 'avatar',
  },
  {
    label: '金币',
    type: 'number',
    name: 'coin',
    default: 0,
  },
];

class UserController extends Controller {

  async index() {
    const { ctx, app } = this;

    let data = await ctx.page('User');

    await ctx.renderTemplate({
      title: '用户管理',
      tempType: 'table',
      table: {
        // 按钮
        buttons: {
          add: '/admin/user/create',
        },
        // 表头
        columns: [
          {
            title: '用户',
            fixed: 'left',
            render(item) {
              let avatar =
                item.avatar || '/public/assets/img/profiles/avatar-01.jpg'
              return `<h2 class="table-avatar">
              <a class="avatar avatar-sm mr-2"><img class="avatar-img rounded-circle bg-light" src="${avatar}"></a>
              <a>${item.username}</a>
              </h2>`
            },
          },
          {
            title: '金币',
            key: 'coin',
            width: 180,
            fixed: 'center',
          },
          {
            title: '时间',
            key: 'create_time',
            width: 180,
            fixed: 'center',
          },
          {
            title: '操作',
            width: 200,
            fixed: 'center',
            action: {
                edit: function(id) {
                  return `/admin/user/edit/${id}`;
                },
                delete:function(id) {
                  return `/admin/user/delete/${id}`;
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
      title: '创建用户',
      tempType: 'form',
      form: {
        // 提交地址
        action: '/admin/user',
        fields,
      },
      // 新增成功跳转路径
      successUrl: '/admin/user',
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
      avatar: {
        type: 'string',
      },
      coin: {
        type: 'int',
      },
    });
    let { username, password, avatar, coin} = ctx.request.body;


    // 验证用户是否已经存在
    if (await app.model.User.findOne({
      where: { username },
    })) {
      ctx.throw(400, '用户名已存在');
    }
    // 创建用户
    let user = await app.model.User.create({
      username,
      password,
      avatar,
      coin,
    });
    if (!user) {
      ctx.throw(400, '创建用户失败');
    }
    ctx.apiSuccess(user);
  }

  // 编辑用户
  async edit() {
    const { ctx, app } = this;
    const id = ctx.params.id;
    let data = await app.model.User.findOne({
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
      title: '修改用户',
      tempType: 'form',
      form: {
        // 提交地址
        action: '/admin/user/' + ctx.params.id,
        fields,
        data,
      },
      // 新增成功跳转路径
      successUrl: '/admin/user',
    });
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
      avatar: {
        type: 'string',
      },
      coin: {
        type: 'int',
      },
    });
    const id = ctx.params.id;
    const {username,password,avatar,coin} = ctx.request.body;
    // 用户名是否被使用
    const Op = app.Sequelize.Op
    if (
      await app.model.User.findOne({
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
    let user = await app.model.User.findOne({
      where: {
        id,
      },
    })
    if (!user) {
      return ctx.apiFail('该记录不存在')
    }

    user.username = username
    user.avatar = avatar
    user.coin = coin
    if (password) {
        user.password = password
    }
    ctx.apiSuccess(await user.save())
  }

    // 删除管理员
    async delete() {
        const { ctx, app } = this;
        const id = ctx.params.id;
        await app.model.User.destroy({
          where: {
            id,
          },
        });
        ctx.toast('删除成功', 'success')
        ctx.redirect('/admin/user')
      }
}


module.exports = UserController;
