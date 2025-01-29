import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('orders', (table) => {
        table.increments('id').primary();
        table.integer('table_session_id').unsigned().notNullable().references('id').inTable('table_sessions').onDelete('CASCADE');
        table.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('CASCADE');
        table.integer('quantity').unsigned().notNullable();
        table.decimal('price').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('orders');
}
