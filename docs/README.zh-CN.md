# Any Listen 扩展模板创建工具

[English](../README.md) | 简体中文

用于创建 Any Listen 第三方扩展程序的项目模板，提供通用模板与隔离环境模板两种选择。

## 功能

- 交互式选择模板类型
- 自动下载最新模板并创建项目
- 生成 `.env`（包含 RSA 密钥）
- 自动安装依赖

## 环境要求

- Node.js >= 22
- 可用的包管理器：npm / yarn / pnpm

## 使用方式

推荐使用 `npx` 或 `pnpm dlx` 直接运行：

```bash
npx @any-listen/create-extension
```

```bash
pnpm dlx @any-listen/create-extension
```

## 交互流程

1. 选择模板类型：通用模板 / 隔离环境模板
2. 输入 GitHub 用户名与仓库名（可选，格式为 `user/repo`）
3. 输入项目名称（不填 GitHub 时必填）
4. 选择包管理器

## 模板说明

- 通用模板：适合大多数扩展项目
- 隔离环境模板：适用于需要子隔离运行环境的扩展项目

## 注意事项

- 模板会从 `any-listen/extension-template` 的最新发布版本下载
- 若当前目录已存在同名项目，将终止创建
- 依赖安装失败会导致创建流程中断

## 开发

```bash
pnpm install
pnpm run build
```
