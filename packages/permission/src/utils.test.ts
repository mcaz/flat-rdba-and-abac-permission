import { describe, it, expect } from 'vitest';
import { definePermissions, verifyPermission } from './utils';
import { Grants, RoleEnum } from './types';

describe('verifyPermission', () => {
  const grants = {
    "resource:article": definePermissions({
      read: {
        ADMIN: () => true,
        GENERAL: () => false,
      },
      create: {
        ADMIN: () => true,
        GENERAL: () => false,
      },
      update: {},
      delete: {},
    }),
    "resource:user": definePermissions({
      read: {
        ADMIN: () => true,
      },
      create: {
        ADMIN: () => false,
        GENERAL: () => false,
      },
    }),
    "page:users/[id]": definePermissions<{ userId: string }>({
      read: {
        ADMIN: (ctx) => ctx.dynamicParam.userId === "admin-user-id",
        GENERAL: (ctx) => ctx.dynamicParam.userId === "general-user-id",
      },
    }),
  } as Partial<Grants>;

  it('ADMINは記事を読める', () => {
    const result = verifyPermission({
      grants: grants as Grants,
      role: RoleEnum.ADMIN,
      action: 'read',
      resource: 'resource:article',
      context: { dynamicParam: undefined },
    });
    expect(result).toBe(true);
  });

  it('GENERALは記事を読めない', () => {
    const result = verifyPermission({
      grants: grants as Grants,
      role: RoleEnum.GENERAL,
      action: 'read',
      resource: 'resource:article',
      context: { dynamicParam: undefined },
    });
    expect(result).toBe(false);
  });

  it('ロール未指定はfalse', () => {
    const result = verifyPermission({
      grants: grants as Grants,
      role: undefined,
      action: 'read',
      resource: 'resource:article',
      context: { dynamicParam: undefined },
    });
    expect(result).toBe(false);
  });

  describe('リソース: 記事', () => {
    it('ADMINは記事を作成できる', () => {
      const result = verifyPermission({
        grants: grants as Grants,
        role: RoleEnum.ADMIN,
        action: 'create',
        resource: 'resource:article',
        context: { dynamicParam: undefined },
      });
      expect(result).toBe(true);
    });

    it('GENERALは記事を作成できない', () => {
      const result = verifyPermission({
        grants: grants as Grants,
        role: RoleEnum.GENERAL,
        action: 'create',
        resource: 'resource:article',
        context: { dynamicParam: undefined },
      });
      expect(result).toBe(false);
    });

    it('未定義のアクションはfalseを返す', () => {
      const result = verifyPermission({
        grants: grants as Grants,
        role: RoleEnum.ADMIN,
        action: 'update',
        resource: 'resource:article',
        context: { dynamicParam: undefined },
      });
      expect(result).toBe(false);
    });
  });

  describe('リソース: ユーザー', () => {
    it('ADMINはユーザーを閲覧できる', () => {
      const result = verifyPermission({
        grants: grants as Grants,
        role: RoleEnum.ADMIN,
        action: 'read',
        resource: 'resource:user',
        context: { dynamicParam: undefined },
      });
      expect(result).toBe(true);
    });

    it('GENERALはユーザーを閲覧できない', () => {
      const result = verifyPermission({
        grants: grants as Grants,
        role: RoleEnum.GENERAL,
        action: 'read',
        resource: 'resource:user',
        context: { dynamicParam: undefined },
      });
      expect(result).toBe(false);
    });

    it('ADMINはユーザーを作成できない', () => {
      const result = verifyPermission({
        grants: grants as Grants,
        role: RoleEnum.ADMIN,
        action: 'create',
        resource: 'resource:user',
        context: { dynamicParam: undefined },
      });
      expect(result).toBe(false);
    });
  });

  describe('ページ: ユーザー詳細', () => {
    it('ADMINは特定のユーザーIDでアクセス可能', () => {
      const result = verifyPermission({
        grants: grants as Grants,
        role: RoleEnum.ADMIN,
        action: 'read',
        resource: 'page:users/[id]',
        context: { dynamicParam: { userId: 'admin-user-id' } },
      });
      expect(result).toBe(true);
    });

    it('ADMINは異なるユーザーIDではアクセス不可', () => {
      const result = verifyPermission({
        grants: grants as Grants,
        role: RoleEnum.ADMIN,
        action: 'read',
        resource: 'page:users/[id]',
        context: { dynamicParam: { userId: 'other-user-id' } },
      });
      expect(result).toBe(false);
    });

    it('GENERALは自分のユーザーIDでアクセス可能', () => {
      const result = verifyPermission({
        grants: grants as Grants,
        role: RoleEnum.GENERAL,
        action: 'read',
        resource: 'page:users/[id]',
        context: { dynamicParam: { userId: 'general-user-id' } },
      });
      expect(result).toBe(true);
    });
  });
}); 