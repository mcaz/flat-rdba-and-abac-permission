import { definePermissions } from "./utils";


export const grants = {
  // リソースに対する権限定義
  "resource:article": definePermissions({
    read: {
      // 全ロールが閲覧可能
      ADMIN: () => true,
      GENERAL: () => true,
      DEVELOPER: () => true,
    },
    // 未定義のアクションは全ロールが実行不可
    // create: 未定義,
    update: undefined,
    delete: {},
  }),

  "resource:user": definePermissions({
    read: {
      // 管理者のみ閲覧可能
      ADMIN: () => true,
    },
    create: {
      // 全ロールが作成不可
      ADMIN: () => false,
      DEVELOPER: () => false,
      GENERAL: () => false,
    },
  }),

  // ページに対する権限定義
  "page:users/[id]": definePermissions<{ userId: string }>({
    read: {
      // 指定されたuserIdと一致する場合のみ閲覧可能
      ADMIN: (ctx) => {
        return ctx.dynamicParam.userId === "455cb998-2cb3-41cd-8c9e-41416db7d4abc";
      },
      // ログインユーザーのIDとURLパラメータのidが一致する場合のみ閲覧可能
      GENERAL: (ctx) => {
        return ctx.dynamicParam.userId === "455cb998-2cb3-41cd-8c9e-41416db7d4dfg";
      },
      // 閲覧不可
      DEVELOPER: () => false,
    },
  }),

  "page:articles/[id]": definePermissions<boolean>({
    read: {
      // allowLinkがtrueの場合のみ閲覧可能
      ADMIN: ({ dynamicParam: allowLink }) => allowLink,
      GENERAL: ({ dynamicParam: allowLink }) => allowLink,
      DEVELOPER: ({ dynamicParam: allowLink }) => allowLink,
    },
  }),

  // コンポーネントに対する権限定義
  "component:organisms/Header": definePermissions({
    read: {
      // ADMINのみコンポーネント表示可能
      ADMIN: () => true,
    },
  }),

  // 全ロールが全アクションに対して実行不可
  "component:organisms/Sidebar": definePermissions(),

  // challenges/pageページ内のorganisms/ChallengeCardTabsコンポーネントに対しての権限定義
  "component:challenges/page#organisms/ChallengeCardTabs": definePermissions({
    read: {
      // 全ロールが閲覧可能
      ADMIN: () => true,
      GENERAL: () => true,
      DEVELOPER: () => true,
    },
    update: {
      // ADMINのみコンポーネント更新可能
      ADMIN: () => true,
    },
  }),
} as const;