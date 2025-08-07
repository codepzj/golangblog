export const SITE = {
  website: "https://www.codepzj.cn/", // 网站地址
  author: "浩瀚星河",
  profile: "https://www.codepzj.cn/",
  desc: "最全面的Go语言中文学习平台,提供高质量的中文教程和社区支持,助力开发者快速掌握Go语言。",
  title: "浩瀚星河",
  ogImage: "og.jpg",
  lightAndDarkMode: false, // 是否开启暗黑模式
  postPerIndex: 3, // 首页文章数量
  postPerPage: 10, // 分页文章数量
  scheduledPostMargin: 15 * 60 * 1000, // 15分钟
  showArchives: true, // 是否显示归档
  showBackButton: true, //在文章详情页显示返回按钮
  editPost: {
    enabled: true,
    text: "编辑页面",
    url: "https://github.com/codepzj/golangblog/edit/main/",
  },
  dynamicOgImage: true, // 是否动态生成og:image
  dir: "ltr", // "rtl" | "auto" 语言方向
  lang: "zh-CN", // 语言代码
  timezone: "Asia/Shanghai", // 时区
} as const;
