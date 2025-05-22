import { relations, sql } from 'drizzle-orm';
import { index, pgEnum, pgTableCreator, primaryKey } from 'drizzle-orm/pg-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { type AdapterAccount } from 'next-auth/adapters';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `botfactory_${name}`);

// Enums
export const nodeTypeEnum = pgEnum('node_type', [
  'message',
  'input',
  'condition',
  'api_call',
  'data_storage',
  'media',
  'location',
  'payment',
]);

export const botStatusEnum = pgEnum('bot_status', [
  'draft',
  'published',
  'paused',
  'archived',
]);

export const deploymentStatusEnum = pgEnum('deployment_status', [
  'in_progress',
  'deployed',
  'failed',
]);

export const bots = createTable(
  'bot',
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.varchar({ length: 256 }).notNull(),
    token: d.text('token').notNull().unique(),
    webhookUrl: d.text('webhookUrl'),
    status: botStatusEnum('status').notNull(),
    metadata: d.jsonb('metadata'),
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index('created_by_idx').on(t.createdById),
    index('name_idx').on(t.name),
  ],
);

export const botInsertSchema = createInsertSchema(bots);
export const botUpdateSchema = createUpdateSchema(bots);

export const botComponents = createTable('bot_component', (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  botId: d
    .text('bot_id')
    .references(() => bots.id, { onDelete: 'cascade' })
    .notNull(),
  type: d
    .text('type', {
      enum: ['command', 'message', 'keyboard', 'middleware'],
    })
    .notNull(),
  trigger: d.text('trigger'), // Для команд: "/start", для текста: regex
  config: d.jsonb('config').notNull(), // { response: "Hello!", buttons: [...] }
  order: d.integer('order').notNull().default(0),
  createdById: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => users.id),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const botConversations = createTable('bot_conversation', (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  currentNodeId: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => workflowNodes.id),
  variables: d.jsonb().default({}).notNull(),
  botId: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => bots.id),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const botWorkflows = createTable('bot_workflow', (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }).notNull(),
  botId: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => bots.id, { onDelete: 'cascade' }),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const botWorkflowsToBots = createTable('bot_workflow_to_bot', (d) => ({
  botId: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => bots.id),
  botWorkflowId: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => botWorkflows.id),
}));

// Nodes table
export const workflowNodes = createTable('workflow_node', (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  type: nodeTypeEnum('type').notNull(),
  name: d.text('name').notNull(),
  workflowId: d
    .text('workflow_id')
    .notNull()
    .references(() => botWorkflows.id, { onDelete: 'cascade' }),
  position: d.json('position').notNull(), // { x: number, y: number }
  data: d.json('data'), // Node-specific configuration
  createdAt: d.timestamp('created_at').defaultNow().notNull(),
  updatedAt: d.timestamp('updated_at').defaultNow().notNull(),
}));

// Edges (connections between nodes)
export const workflowEdges = createTable('workflow_edge', (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sourceId: d
    .text('source_id')
    .notNull()
    .references(() => workflowNodes.id, { onDelete: 'cascade' }),
  targetId: d
    .text('target_id')
    .notNull()
    .references(() => workflowNodes.id, { onDelete: 'cascade' }),
  workflowId: d
    .text('workflow_id')
    .notNull()
    .references(() => botWorkflows.id, { onDelete: 'cascade' }),
  name: d.text('name'),
  condition: d.json('condition'),
  createdAt: d.timestamp('created_at').defaultNow().notNull(),
  updatedAt: d.timestamp('updated_at').defaultNow().notNull(),
}));

// Deployments history
export const botDeployments = createTable('bot_deployment', (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  botId: d
    .text('bot_id')
    .notNull()
    .references(() => bots.id, { onDelete: 'cascade' }),
  status: deploymentStatusEnum('status').notNull(),
  logs: d.text('logs'),
  createdAt: d.timestamp('created_at').defaultNow().notNull(),
  updatedAt: d.timestamp('updated_at').defaultNow().notNull(),
}));

export const users = createTable('user', (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: 'date',
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
}));

export const accounts = createTable(
  'account',
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount['type']>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index('account_user_id_idx').on(t.userId),
  ],
);

export const sessions = createTable(
  'session',
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: 'date', withTimezone: true }).notNull(),
  }),
  (t) => [index('t_user_id_idx').on(t.userId)],
);

export const verificationTokens = createTable(
  'verification_token',
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: 'date', withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  bots: many(bots),
}));

export const botsRelations = relations(bots, ({ one, many }) => ({
  users: one(users, {
    fields: [bots.id],
    references: [users.id],
  }),
  botComponents: many(botComponents),
  botConversations: many(botConversations),
  botWorkflowsToBots: one(botWorkflowsToBots, {
    fields: [bots.id],
    references: [botWorkflowsToBots.botId],
  }),
  BotDeployments: many(botDeployments),
}));

export const botConversationsRelations = relations(
  botConversations,
  ({ one }) => ({
    bots: one(bots, {
      fields: [botConversations.botId],
      references: [bots.id],
    }),
    workflowNodes: one(workflowNodes, {
      fields: [botConversations.currentNodeId],
      references: [workflowNodes.id],
    }),
  }),
);

export const botDeploymentsRelations = relations(botDeployments, ({ one }) => ({
  bots: one(bots, { fields: [botDeployments.botId], references: [bots.id] }),
}));

export const botWorkflowsRelations = relations(
  botWorkflows,
  ({ one, many }) => ({
    botWorkflowsToBots: one(botWorkflowsToBots, {
      fields: [botWorkflows.id],
      references: [botWorkflowsToBots.botWorkflowId],
    }),
    workflowNodes: many(workflowNodes),
    workflowEdges: many(workflowEdges),
  }),
);

export const workflowNodesRelations = relations(
  workflowNodes,
  ({ one, many }) => ({
    botWorkflows: one(botWorkflows, {
      fields: [workflowNodes.workflowId],
      references: [botWorkflows.id],
    }),
    workflowEdges: many(workflowEdges),
  }),
);

export const workflowEdgesRelations = relations(workflowEdges, ({ one }) => ({
  botWorkflows: one(botWorkflows, {
    fields: [workflowEdges.workflowId],
    references: [botWorkflows.id],
  }),
  workflowNodes: one(workflowNodes, {
    fields: [workflowEdges.sourceId, workflowEdges.targetId],
    references: [workflowNodes.id, workflowNodes.id],
  }),
}));

export const botComponentsRelations = relations(botComponents, ({ one }) => ({
  bot: one(bots, {
    fields: [botComponents.botId],
    references: [bots.id],
  }),
}));
