import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc, ownerAc, memberAc } from "better-auth/plugins/organization/access"

const crudAccessControl = ["list", "get", "create", "update", "delete"] as const;

export const statement = {
    ...defaultStatements,
    transaction: crudAccessControl,
    subscription: crudAccessControl,
    // this refers to account entity (for future when we add account to group transactions)
    accounts: crudAccessControl,
} as const;

export const accessControl = createAccessControl(statement);

export const owner = accessControl.newRole({
    transaction: ["list", "get", "create", "update", "delete"],
    subscription: ["list", "get", "create", "update", "delete"],
    accounts: ["list", "get", "create", "update", "delete"],
    ...ownerAc.statements,
})

export const admin = accessControl.newRole({
    transaction: ["list", "get", "create", "update", "delete"],
    subscription: ["list", "get", "create", "update", "delete"],
    accounts: ["list", "get", "create", "update", "delete"],
    ...adminAc.statements,
})

export const editor = accessControl.newRole({
    transaction: ["list", "get", "create", "update", "delete"],
    subscription: ["list", "get", "create", "update", "delete"],
    accounts: ["list", "get", "create", "update", "delete"],
    ...memberAc.statements,
})

export const viewer = accessControl.newRole({
    transaction: ["list", "get"],
    subscription: ["list", "get"],
    accounts: ["list", "get"],
})
