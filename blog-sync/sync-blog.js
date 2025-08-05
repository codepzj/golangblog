import fs from "fs";
import path from "path";

let postList = []
const __dirname = path.resolve();
const blogDir = path.join(__dirname, "src", "data", "blog");

// 调用远程接口获取文章列表
const getBlogList = async () => {
  const req = await fetch("https://blog-api.golangblog.com/post/all");
  const res = await req.json();
  postList = res.data;
};

// 同步文章到astro
const syncBlog = async () => {
  await getBlogList();

  // 先删除掉src/data/blog目录下的所有文件
  fs.readdirSync(blogDir).forEach((file) => {
    const fullPath = path.join(blogDir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // 如果是目录，递归删除
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      // 如果是文件，直接删除
      fs.unlinkSync(fullPath);
    }
  });

  postList.forEach(async (item) => {
    const description = item.description
      .replace(/<[^>]*>?/g, "")               // 去 HTML 标签
      .replace(/`+/g, "")                     // 去 `
      .replace(/\*+/g, "")                    // 去 * 和 **
      .replace(/#+/g, "")                     // 去 #（标题）
      .replace(/~+/g, "")                     // 去 ~~
      .replace(/_+/g, "")                     // 去 _
      .replace(/\[.*?\]\(.*?\)/g, "")         // 去 markdown 链接 [text](url)
      .replace(/!\[.*?\]\(.*?\)/g, "")        // 去图片 ![alt](url)
      .replace(/^[>\-\+\*]\s*/gm, "")         // 去引用符号 > 和列表项 - + *
      .replace(/[\r\n]+/g, " ")               // 换行变空格
      .replace(/\s+/g, " ")                   // 多空格压缩为1个
      .trim();

    // frontmatter
    const frontmatter = `---
title: ${item.title}
description: ${description}
author: ${item.author}
pubDatetime: ${item.created_at}
modDatetime: ${item.updated_at}
slug: ${item.alias}
featured: ${item.is_top}
tags: [${item.tags}]
ogImage: ${item.thumbnail}
---`;
    fs.writeFileSync(
      path.join(blogDir, item.alias + ".md"),
      `${frontmatter}

      ${item.content}`
    );
  });
};

syncBlog();
