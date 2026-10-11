# Makue 编程垫脚课

浅色静态站：先补**课前垫脚**，再上**正式启动课**（Big-O 直觉 + 数组 / Set / Map 取舍），为代码审查打基础。

## 页面

| 页面 | 说明 |
|------|------|
| [首页](index.html) | 入口与学习顺序 |
| [课前垫脚](prep.html) | 程序、变量、函数、循环、数组、读码级 JS/TS、复杂度直觉、练习与自检 |
| [正式启动课](lesson.html) | n 与 O(1)/O(n)/O(n²)、数组代价、Set / Map、选择/填空小测、LeetCode 上平台练 |

两页互相跳转：垫课末「去上正式课」，正式课顶「先补垫课」。

## 本地预览

用任意静态服务器打开仓库根目录即可，例如：

```bash
python3 -m http.server 8080
```

浏览器访问 `http://localhost:8080/`。

## GitHub Pages

本仓库以 `main` 分支根目录发布。线上地址形如：

`https://larryboineuq.github.io/makue-prep/`

## 设计说明

- 浅色纸感背景、靛蓝强调色、大号中文字体
- 单仓多页、共享 `styles.css` / `app.js`
- 课内小测为选择/填空；编程练题链到 LeetCode 真题（leetcode.cn）
- 教学内容自包含；精读外链按单元指定小节

## 许可

教学示例，可按需自行使用与修改。
