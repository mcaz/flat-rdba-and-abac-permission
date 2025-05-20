# rdba-abac-auth 権限管理パッケージ

## 概要
このパッケージは、Reactアプリケーション向けの権限管理（Flat RBAC + ABAC: ロールベース + 属性ベースアクセス制御）を提供します。主に`usePermission`フックを利用して、ユーザーのロールやリソース、アクション、動的パラメータに基づいた権限判定が可能です。

---

## 主な機能
- **権限定義**: `packages/permission/src/grants.ts` でリソースごとにロール・アクション単位で権限を定義
- **権限判定フック**: `usePermission`フックで、Reactコンポーネント内から簡単に権限チェック
- **動的パラメータ対応**: URLパラメータや任意の値を権限判定の条件に利用可能

---

## 使い方

### 1. 権限定義の例
`packages/permission/src/grants.ts` でリソースごとに権限を定義します。

```ts
export const grants = {
  "resource:article": definePermissions({
    read: {
      ADMIN: () => true,
      GENERAL: () => true,
      DEVELOPER: () => true,
    },
    update: undefined,
    delete: {},
  }),
  // ...他リソースも同様に定義
};
```

### 2. フックの使い方
`usePermission`フックを使って、権限判定を行います。

#### usePermissionフックの引数
```ts
usePermission(
  action?: Actions,
  resource?: Resources,
  dynamicParam?: ResourceDynamicParam<Resources>
): { can: CanFunction, hasPermission: boolean }
```
- `action`: 実行したいCRUDアクション（例: 'read', 'create' など）
- `resource`: 対象リソース名、grants内で`definePermissions`を使用して定義したプロパティ名が対応する
- `dynamicParam`: 動的パラメータ（リソースによって型が異なり、`definePermissions`のジェネリクスで指定する）
- **返り値**: 
  - `hasPermission`: 指定された引数に対する権限の有無（boolean | null）
  - `can`: 権限判定を行う関数、引数は`usePermission`と同じ、戻り値は`hasPermission`と同様

#### hasPermissionについて
`usePermission`フックが返す`hasPermission`は、フックの引数で指定されたアクション・リソース・動的パラメータに対する権限の有無を表す真偽値です。
`usePermission`の引数が空の場合にはnullが設定されます。

```tsx
const { hasPermission } = usePermission('read', 'resource:article', undefined);
// hasPermissionがtrueなら表示、falseなら非表示など
```

#### 基本的な使い方
```tsx
import { usePermission } from '~/hooks/usePermission';

function MyComponent() {
  const { can } = usePermission();

  const isAllowed = can('read', 'resource:article', undefined);
  // isAllowedがtrueなら表示、falseなら非表示など
  // 第三引数は必至、definePermissionsのジェネリクスで指定されえいない場合はデフォルト値のundefinedを指定する
  
}
```

#### 動的パラメータを使った判定
```tsx
const { hasPermission } = usePermission(
  'read',
  'page:users/[id]',
  { userId: "ユーザーID" }
);
```

#### dynamicParamについて
`can`関数や`usePermission`フックの第3引数`dynamicParam`は、リソースごとに異なる「動的なパラメータ」を権限判定の条件として渡すためのものです。

- 例：ユーザーIDやフラグなど、リソースごとに必要な情報を渡せます。
- 例えば、`page:users/[id]`なら`{ userId: string }`、`page:articles/[id]`なら`boolean`など、リソースごとに型が異なります。

##### 型推論について
`grants`の権限定義で`definePermissions<T>()`のジェネリクス（型引数）を指定することで、
そのリソースの`dynamicParam`の型が自動的に推論されます。

```ts
// grants.ts の例
"page:users/[id]": definePermissions<{ userId: string }>({
  read: {
    ADMIN: (ctx) => ctx.dynamicParam.userId === "...",
    // ...
  },
}),

// これにより usePermission で型安全に dynamicParam を渡せる
const { hasPermission } = usePermission(
  'read',
  'page:users/[id]',
  { userId: "ユーザーID" } // ← 型が自動推論される
);
```
- **メリット**: 型エラーを防ぎ、リソースごとに適切なパラメータを渡せるようになります。