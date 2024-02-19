import { Context, Schema } from 'koishi';

export const name = 'b23';

export interface Config {
  defaultNum: number;
  maxNum: number;
  api: string;
}

export const Config: Schema<Config> = Schema.object({
  defaultNum: Schema.number().min(1).max(100).step(1).default(10).description('获取热搜的默认数量'),
  maxNum: Schema.number().min(1).max(100).step(1).default(20).description('获取热搜的最大数量'),
  api: Schema.string()
    .default(
      process.env.KOISHI_ENV === 'browser'
        ? 'https://b23.api888.top/x/v2/search/trending/ranking'
        : 'https://app.bilibili.com/x/v2/search/trending/ranking'
    )
    .description('api地址'),
});

export function apply(ctx: Context, config: Config) {
  ctx
    .command('b23 [num:number]', '获取B站热搜')
    .alias('B站热搜')
    .action(async (_, num?) => {
      let targetNum;
      if (num === undefined) {
        targetNum = config.defaultNum;
      } else if (parseInt(num + '') !== num) {
        return '请输入整数';
      } else if (num < 1) {
        return '热搜数量最小为1';
      } else {
        targetNum = Math.min(num, config.maxNum);
      }

      try {
        const data = await ctx.http.get(`${config.api}?limit=${targetNum}`);
        const msgs = ['B站热搜'];
        const list = data?.data?.list || [];
        for (let i = 0; i < list.length; i++) {
          msgs.push(`${i + 1}. ${list[i].keyword}`);
        }
        return msgs.join('\n');
      } catch (e) {
        ctx.logger('b23').error(e);
        return '获取热搜失败';
      }
    });
}
